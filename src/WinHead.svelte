<style>
    button {
        cursor: pointer;
        width: 1.5rem;
        height: 1.5rem;
        background-color: rgba(0,0,0,0);
        border-radius: 50%;
        transition: all 400ms ease-in-out;
    }
    button:hover {
        background-color: #fff;
        color: #1d1d1d;
    }
</style>
<div class="d-flex bg-dark px-3 py-2 justify-between text-white">
    <div>
        <nav class="nav">
            <div class="dropdown">
                <a class="nav-link dropdown-toggle active" data-bs-toggle="dropdown" aria-expanded="false" aria-current="page" href="#">File</a>
                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2">
                    <li>
                        <input type="file" name="open_file" id="open_input" multiple accept="audio/*" class="d-none">
                        <a class="dropdown-item" id="open_link" href="#">Open File</a>
                    </li>
                    <li><a class="dropdown-item" href="#">Open Directory</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#">Separated link</a></li>
                </ul>
            </div>
            <div class="dropdown">
                <a class="nav-link dropdown-toggle active" data-bs-toggle="dropdown" aria-expanded="false" aria-current="page" href="#">Edit</a>
                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2">
                    <li><a class="dropdown-item active" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#">Separated link</a></li>
                </ul>
            </div>
            <div class="dropdown">
                <a class="nav-link dropdown-toggle active" data-bs-toggle="dropdown" aria-expanded="false" aria-current="page" href="#">Settings</a>
                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2">
                    <li><a class="dropdown-item active" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#">Separated link</a></li>
                </ul>
            </div>
            <div class="dropdown">
                <a class="nav-link dropdown-toggle active" data-bs-toggle="dropdown" aria-expanded="false" aria-current="page" href="#">About</a>
                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2">
                    <li><a class="dropdown-item active" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#">Separated link</a></li>
                </ul>
            </div>
        </nav>
    </div>
    <div>
        <button type="button">
            <i class="fal fa-window-minimize"></i>
        </button>
        <button type="button" class="mx-3">
            <i class="fal fa-expand"></i>
        </button>
        <button type="button">
            <i class="fal fa-times"></i>
        </button>
    </div>
</div>