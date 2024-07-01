<script>
    import { onMount } from 'svelte';
    let vehicleName = '';
    let maxBikes = 0;
    let maxPeople = 0;
    let lists = [];
    let newName = '';
    let hasBike = false;
    let onlyBike = false;

    onMount(() => {
        const savedLists = localStorage.getItem('tripLists');
        if (savedLists) {
            lists = JSON.parse(savedLists);
        }
    });

    function createList() {
        if (vehicleName && maxBikes && maxPeople) {
            const newList = {
                id: Date.now().toString(),
                vehicleName,
                maxBikes: parseInt(maxBikes, 10),
                maxPeople: parseInt(maxPeople, 10),
                items: []
            };
            lists = [...lists, newList];
            saveToLocalStorage();
            clearForm();
        }
    }

    function addItem(listId) {
        const listIndex = lists.findIndex(list => list.id === listId);
        const list = lists[listIndex];
        const totalPeople = list.items.filter(item => !item.onlyBike).length;
        const totalBikes = list.items.filter(item => item.hasBike || item.onlyBike).length;

        if (totalPeople >= list.maxPeople && !onlyBike) {
            alert("Máximo de personas alcanzado");
            return;
        }

        if (totalBikes >= list.maxBikes && (hasBike || onlyBike)) {
            alert("Máximo de bicis alcanzado");
            return;
        }

        const newItem = {
            id: Date.now().toString(),
            name: newName,
            hasBike,
            onlyBike
        };
        lists[listIndex].items = [...lists[listIndex].items, newItem];
        saveToLocalStorage();
        clearItemForm();
    }

    function deleteItem(listId, itemId) {
        const listIndex = lists.findIndex(list => list.id === listId);
        lists[listIndex].items = lists[listIndex].items.filter(item => item.id !== itemId);
        saveToLocalStorage();
    }

    function deleteList(listId) {
        lists = lists.filter(list => list.id !== listId);
        saveToLocalStorage();
    }

    function saveToLocalStorage() {
        localStorage.setItem('tripLists', JSON.stringify(lists));
    }

    function clearForm() {
        vehicleName = '';
        maxBikes = 0;
        maxPeople = 0;
    }

    function clearItemForm() {
        newName = '';
        hasBike = false;
        onlyBike = false;
    }
</script>

<style>
    .container {
        max-width: 800px;
        margin: auto;
        background: white;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
        text-align: center;
    }

    .new-list-form, .new-item-form {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    .new-list-form input, .new-list-form button, .new-item-form input, .new-item-form button {
        padding: 10px;
        font-size: 1rem;
    }

    .list {
        margin-bottom: 20px;
    }

    .list h2 {
        margin-top: 0;
    }

    .list-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
</style>

<div class="container">
    <h1>Trip Planner</h1>
    <div class="new-list-form">
        <input type="text" bind:value={vehicleName} placeholder="Nombre del vehículo">
        <input type="number" bind:value={maxBikes} placeholder="Máximo de bicis">
        <input type="number" bind:value={maxPeople} placeholder="Máximo de personas">
        <button on:click={createList}>Crear Lista</button>
    </div>
    <div>
        {#each lists as list (list.id)}
            <div class="list" id={list.id}>
                <h2>{list.vehicleName} (Máximo bicis: {list.maxBikes}, Máximo personas: {list.maxPeople})</h2>
                <div class="list-items">
                    {#each list.items as item (item.id)}
                        <div class="list-item">
                            <span>{item.name} {item.onlyBike ? '(Solo bici)' : item.hasBike ? '(Con bici)' : ''}</span>
                            <button on:click={() => deleteItem(list.id, item.id)}>Eliminar</button>
                        </div>
                    {/each}
                </div>
                <div class="new-item-form">
                    <input type="text" bind:value={newName} placeholder="Nombre de la persona">
                    <input type="checkbox" bind:checked={hasBike}> Lleva bici
                    <input type="checkbox" bind:checked={onlyBike}> Solo bici
                    <button on:click={() => addItem(list.id)}>Añadir</button>
                </div>
                <button on:click={() => deleteList(list.id)}>Eliminar Lista</button>
            </div>
        {/each}
    </div>
</div>
