export default class FilesStorage {
    setToLocalStorage(arr) {
        //save the array to localStorage
        localStorage.setItem('files',JSON.stringify(arr));
        //console.log(JSON.stringify(myArray));
    }
    getFromLocalStorage() {
        //console.log(JSON.parse(localStorage.getItem('files')))
        return JSON.parse(localStorage.getItem('files'))
    }

}