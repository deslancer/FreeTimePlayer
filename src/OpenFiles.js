import FilesStorage from "./FilesStorage";

export default class OpenFiles {
    constructor() {
        this.files = [];
    }
    drag_n_drop(){
        document.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            /*for (const f of event.dataTransfer.files) {
                console.log(f)
                // Using the path attribute to get absolute file path
                console.log('File Path of dragged files: ', f.path)
            }*/
            this.files.push(event.dataTransfer.files)
        });
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        document.addEventListener('dragenter', (event) => {
            //console.log('File is in the Drop Space');
        });
        document.addEventListener('dragleave', (event) => {
            //console.log('File has left the Drop Space');
        });
    }
    input_file() {
        let open_link = document.getElementById('open_link');
        let file_input = document.getElementById('open_input');
        let event = new MouseEvent('click', {bubbles: true});
        let storage = new FilesStorage()
        let input_files;
        open_link.onclick = function (e) {
            e.preventDefault();
            file_input.dispatchEvent(event);
        }
        file_input.onchange = function () {
            input_files = this.files;
            //console.log(input_files)
            //console.log(`File name: ${file.name}`); // например, my.png
            //console.log(`Last modified: ${file.lastModified}`);

            storage.setToLocalStorage(input_files);
            storage.getFromLocalStorage();
        }
        this.files.push(input_files);
    }
    get FilesArray() {
        return this.files
    }
}