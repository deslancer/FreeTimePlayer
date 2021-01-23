<script>
    export let files;
</script>


<input class="form-control" id="search" type="search"
       placeholder="Search" aria-label="Search">
<ul class="list-group mt-2 list-group-flush">
    {#if files !== null}
    {#each files as file}
            <li class="list-group-item">
                <a target="_blank" href="#">{file.name}</a>
            </li>
    {/each}
    <!--<li class="list-group-item">Cras justo odio</li>-->
    {/if}
</ul>