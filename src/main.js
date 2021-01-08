import App from './App.svelte';
import OpenFiles from './OpenFiles.js'
const app = new App({
	target: document.body,
	props: {

	}
});
let open_files_by = new OpenFiles();
open_files_by.drag_n_drop()
open_files_by.input_file()
let audio_files = open_files_by.FilesArray;

export default app;

