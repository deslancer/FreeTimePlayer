import FilesStorage from "./FilesStorage";
import AudioTags from "./AudioTags.js"
export default class OpenFiles {
    constructor() {
        this.files = [];
    }
    drag_n_drop(){
        document.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            let storage = new FilesStorage();
            let converted = this.filesToArray(event.dataTransfer.files);
            this.files.push(converted)
            //console.log(this.files)
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
        let storage = new FilesStorage()
        let f_arr = this.filesToArray;
        let global_array = this.files;
        open_link.onclick = function (e) {
            e.preventDefault();
            file_input.click();
        }
        file_input.onchange = function () {
            let tags = new AudioTags();
            tags.allTags(this.files[0]);
            let converted = f_arr(this.files);
            global_array.push(converted)
            //console.log(global_array)
        }
    }
    filesToArray(files){
        let filesArray = [];
        let file = {};
        for(let i = 0; i < files.length; i++){
            file = {
                'lastModified'    : files[i].lastModified,
                'lastModifiedDate': files[i].lastModifiedDate,
                'name'       : files[i].name,
                'path'       : files[i].path,
                'size'       : files[i].size,
                'type'		 : files[i].type,
            }
            //add the file obj to your array
            filesArray.push(file)
        }
        return filesArray
    }
    get files_array(){
        return this.files
    }
}