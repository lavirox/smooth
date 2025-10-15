const wrapper = document.getElementById("tiles");

let columns = 0,
  rows = 0;

const colors = [
  "rgb(229, 57, 53)",
  "rgb(30, 136, 229)",
  "rgb(67, 160, 71)",
  "rgb(251, 192, 45)",
  "rgb(142, 36, 170)",
  "rgb(255, 112, 67)",
];

let count = -1;

const handleOnClick = (index) => {
  count++;
  anime({
    targets: ".tile",
    backgroundColor: colors[count % (colors.length - 1)],
    delay: anime.stagger(50, { grid: [columns, rows], from: index }),
  });
};

const createTile = (index) => {
  const tile = document.createElement("div");

  tile.classList.add("tile");

  tile.onclick = (e) => handleOnClick(index);

  return tile;
};

const createTiles = (quantity) => {
  Array.from(Array(quantity)).map((tile, index) => {
    wrapper.appendChild(createTile(index));
  });
};

const createGrid = () => {
  console.log("Creating grid...");
  wrapper.innerHTML = "";

  const size = document.body.clientWidth > 800 ? 100 : 50;
  columns = Math.floor(document.body.clientWidth / size);
  rows = Math.floor(document.body.clientHeight / size);
  console.log(`Grid size: ${columns} x ${rows}`);

  wrapper.style.setProperty("--columns", columns);
  wrapper.style.setProperty("--rows", rows);

  createTiles(columns * rows);
  console.log(`Created ${columns * rows} tiles`);
};

createGrid();
window.onresize = () => createGrid();
