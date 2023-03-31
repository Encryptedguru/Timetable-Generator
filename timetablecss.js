const tweakTool = document.querySelector(".tweak-tool");
const aside = document.querySelector("aside");
const container = document.querySelector(".container");
const searchControl = document.querySelector(".search-control");
const searchBtn = searchControl.querySelector(".btn-search");
const searchInput = searchControl.querySelector("input[type=search]");
const saveBtn = document.getElementById("save-btn")
const downLoadBtn = document.getElementById("download-btn")
const  undoBtn = document.getElementById("undo-btn");
const generateBtn = document.querySelector(".btn-generate")



tweakTool.addEventListener("click", (e) => {

        aside.style.width = "130px"
        container.style.marginRight = "200px"
        tweakTool.style.display = "none";
})

document.querySelector(".cancel-btn-aside").addEventListener("click", () => {
        aside.style.width = 0;
        container.style.marginRight = "auto";
        tweakTool.style.display = "block";
}) 


searchBtn.addEventListener("click", e => {
        searchControl.classList.add("active")
        searchInput.focus()
})

searchInput.addEventListener("blur", e => {
        searchControl.classList.remove("active");
})


function enableCtrs() {
        saveBtn.disabled = false;
        downLoadBtn.disabled = false;
        undoBtn.disabled = false;
}

