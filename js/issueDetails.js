(async () => {
  const fetchThemAll = async url => {
    let data = [];
    let page = 1;
    while (true) {
      try {
        const res = await fetch(`${url}?page=${page}&per_page=100`);
        const json = await res.json();
        data.push(...json);
        if (!json.length) break;
        page++;
      } catch (error) {
        break;
      }
    }
    return data;
  };

  const isLessThanAgo = (hour = 1, date) => date > Date.now() - hour * 3600000;
  const setLabels = () =>
    [...document.querySelectorAll(".board-card,.issue")].forEach(card => {
      const { issueId, id } = card.dataset;
      const onlyCard = id;
      const issue = issues[issueId || id];

      if (issue) {
        const {
          assignee,
          state,
          updated_at,
          time_stats: { time_estimate, total_time_spent }
        } = issue;
        const isOpen = state === "opened";
        const updatedDate = new Date(updated_at);
        const lastUpdate = timeAgoInWords(updatedDate.getTime());
        const weekOrOld = isLessThanAgo(5 * 24, updatedDate) ? "😱" : "⚠️";
        const twoDaysOrOld = isLessThanAgo(48, updatedDate) ? "👎" : weekOrOld;
        let emoji = isLessThanAgo(8, updatedDate) ? "👍" : twoDaysOrOld;
        emoji = assignee && isOpen ? emoji : "";
        const cardStyle = `
      height: 1.5em;
      width: 1em;
      padding: 1px;
      padding-top: 0;
      border-radius: 3px;
      text-align: center;
      font-size: small;
      margin-left: 0.5em;
      background: #5cb85b;
      color: white;
      position: absolute;
      top: 0.5em;
      right: 0.5em;
      ${total_time_spent ? "text-decoration: line-through;" : ""}
    `;
        const sp = time_estimate
          ? `<span style="${cardStyle}">${time_estimate / 60 / 60}</span>`
          : "";
        const assignie = card.querySelector(".board-card-assignee,.controls");
        const pointAndTime = card.querySelector(".point-and-time");
        const content = onlyCard ? sp : emoji + lastUpdate + sp;
        if (pointAndTime) {
          pointAndTime.innerHTML = content;
        } else {
          let assignieHtml = assignie.innerHTML;
          assignieHtml += `<span class="point-and-time" style="margin-left: 0.5em">${content}</span>`;
          assignie.innerHTML = assignieHtml;
        }
      }
    });

  const cachedIssues = await idbKeyval.get("issues");
  let issues = JSON.parse(cachedIssues || "{}");

  let issueCardIntervalCount = 0;
  const issueCardInterval = setInterval(async () => {
    const hasIssueCards = document.querySelector(".board-card,.issue");
    if (issueCardIntervalCount > 100) clearInterval(issueCardInterval);
    if (hasIssueCards) {
      clearInterval(issueCardInterval);
      setLabels();
      const { pathname, protocol, host } = location;
      const [, groupName, groupNameUnderGroups] = pathname.split("/");
      const name = groupName === "groups" ? groupNameUnderGroups : groupName;
      issues = (await fetchThemAll(
        `${protocol}//${host}/api/v4/groups/${name}/issues`
      )).reduce((acc, { id, ...issue }) => {
        acc[id] = issue;
        return acc;
      }, {});
      await idbKeyval.set("issues", JSON.stringify(issues));
      setLabels();
    }

    issueCardIntervalCount++;
  }, 100);
})();
