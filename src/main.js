import App from './App.svelte';
import OpenFiles from './OpenFiles.js'
import FilesStorage from './FilesStorage.js'
const app = new App({
	target: document.body,
	props: {

	}
});
let open_files_by = new OpenFiles();
open_files_by.drag_n_drop()
open_files_by.input_file()

export default app;

