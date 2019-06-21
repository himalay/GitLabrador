(() => {
  // Board fold
  let foldableGitLabBoardsIntervalCount = 0;
  const foldableGitLabBoardsInterval = setInterval(() => {
    const boards = [...document.querySelectorAll(".board.is-draggable")];

    if (foldableGitLabBoardsIntervalCount > 100)
      clearInterval(foldableGitLabBoardsInterval);
    if (boards.length) {
      clearInterval(foldableGitLabBoardsInterval);

      document.body.appendChild(
        Object.assign(document.createElement("style"), {
          textContent: `.board.is-collapsed .board-title>span {
                      width: auto;
                      margin-top: 24px;
                      }`
        })
      );

      boards.forEach(board => {
        const boardTitle = board.querySelector(".board-title");
        const toggleIcon = Object.assign(document.createElement("i"), {
          classList: "fa fa-fw board-title-expandable-toggle fa-caret-down",
          style: "cursor: pointer"
        });

        toggleIcon.addEventListener("click", e => {
          board.classList.toggle("is-collapsed");
          e.target.classList.toggle("fa-caret-down");
          e.target.classList.toggle("fa-caret-right");
        });

        boardTitle.prepend(toggleIcon);
      });
    }

    foldableGitLabBoardsIntervalCount++;
  }, 100);
})();
