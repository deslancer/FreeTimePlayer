export default class FilesStorage {
    setToLocalStorage(arr) {
        let files = arr;
        let myArray = [];
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
            myArray.push(file)
        }

        //save the array to localStorage
        localStorage.setItem('files',JSON.stringify(myArray));
        console.log(JSON.stringify(myArray));
    }
    getFromLocalStorage() {
        console.log(JSON.parse(localStorage.getItem('files')))
        return localStorage.getItem('audio_files')
    }

}