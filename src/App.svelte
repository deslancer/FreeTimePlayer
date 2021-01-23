<script>
	import WinHead from './WinHead.svelte';
	import Playlist from './Playlist.svelte';
	import Timeline from './Timeline.svelte';
	import FilesStorage from "./FilesStorage";
	import OpenFiles from "./OpenFiles";
	let storage = new FilesStorage()
	let files = new OpenFiles().files_array
	let files_from_storage = storage.getFromLocalStorage();
	let newarr = []
	files_from_storage.forEach(function(item, i, arr) {
		item.forEach(function (itm, i, arr) {
			newarr.push(itm)
		})
	});

</script>

<style>
	.border-right {
		border-right: 1px solid #ccc;
	}
	.playlist {
		height: calc(100vh - 5.5rem);
	}
	.wrap {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 6rem);
	}
	.cover::before {
		content: '';
		position: absolute; /* Абсолютное позиционирование */
		left: 0; right: 0; top: 0; bottom: 0;
		z-index: -2;
		background: url("https://www.comunidadeculturaearte.com/wp-content/uploads/2018/04/6958632.jpg") top / cover no-repeat;
		filter: blur(3px) grayscale(.75);

	}
	.cover::after {
		content: '';
		position: absolute; /* Абсолютное позиционирование */
		left: 0; right: 0; top: 0; bottom: 0;
		z-index: -1;
		background: rgba(0,0,0,0.5);

	}
	.cover {
		position: relative;
		flex-grow: 1;
		flex-shrink: 0;
		flex-basis: auto;
		padding: 3rem;
	}
	.timeline {
		height: 100px;
		flex-grow: 0;
		flex-shrink: 0;
		flex-basis: auto;
	}

</style>

<WinHead/>
<div class="container-fluid">
	<div class="row p-3">
		<div class="col-4 playlist border-right"><Playlist files="{newarr}"/></div>
		<div class="col-8 wrap">
			<div class="cover">
				<div class="d-flex">
					<div>
						<img width="200" class="album_cover" src="https://www.comunidadeculturaearte.com/wp-content/uploads/2018/04/6958632.jpg" alt="">
					</div>
					<div class="pl-5 my-auto text-white">
						<h5 class="my-4">Giza Butler</h5>
						<h6>Sleep</h6>
						<h6>The Sciences : 2018</h6>
					</div>
				</div>

			</div>

			<div class="timeline">
					<Timeline/>
			</div>
		</div>
	</div>
</div>