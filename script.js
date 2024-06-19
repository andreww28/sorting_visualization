let array = [];

//setting up the canvas
const canvas = document.getElementById('sortCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

let numSkyscrapers = 10; // Number of skyscrapers in the array
let speed = 1000;

const skyscraperImages = [];
let sortingInProgress = false;
let cancelSorting = false;

//getting the tag from the html file and assiging it to the variable
const sort_type_select = document.getElementById('sort-type');
const speed_input = document.getElementById('speed-input');
const item_count_input = document.getElementById('item-count');

const randomize_btn = document.getElementById('randomize');
const start_btn = document.getElementById('start-btn');

// List of images 
// const imageSources = [
//     'skyscraper.png',
//     'skyscraper2.png',
//     'skyscraper3.png',
// ];

const imageSources = [
    'test.png',
];

const Init = (function() {
    //function for adding data to the imagesource that will be use to draw in canvas
    function setSkyscraperImages() {
        imageSources.forEach(src => {
            const img = new Image();
            img.src = src;
            skyscraperImages.push(img);
        });
    }

    //this function for generating a random data in array variable 
    function generateArray() {
        array = [];
        for (let i = 0; i < numSkyscrapers; i++) {
            array.push({
                height: Math.floor(Math.random() * (height - 10)) + 10,
                state: 'default', // State of the skyscraper (default, comparing, swapping, sorted)
                image: skyscraperImages[Math.floor(Math.random() * skyscraperImages.length)] // Assign a random image to each skyscraper
            });
        }
    }

    //this function is for drawing the data/items in array in canvas
    function drawArray() {
        ctx.clearRect(0, 0, width, height);
        const skyscraperWidth = width / numSkyscrapers;
    
        //loop all the data in array
        array.forEach((skyscraper, index) => {
            // Apply filters based on the state
            if (skyscraper.state === 'comparing') {
                ctx.filter = 'brightness(4)'; // Highlight comparing skyscrapers
            } else if (skyscraper.state === 'swapping') {
                ctx.filter = 'hue-rotate(180deg)'; // Shade of blue for sorted skyscrapers
            } else if (skyscraper.state === 'sorted') {
                ctx.filter = 'contrast(2)'; // Highlight swapping skyscrapers
            } else {
                ctx.filter = 'none'; // Default state
            }
    
            const x = index * skyscraperWidth;
            const y = height - skyscraper.height;
    
            // Draw the skyscraper image to the canvas
            ctx.drawImage(
                skyscraper.image, // Image element
                x, // x position
                y, // y position
                skyscraperWidth, // width
                skyscraper.height // height
            );
    
            // Reset filter
            ctx.filter = 'none';
        });
    }

    //this function is responsible for swapping in bubble sort
    function swap(arr, i, j) {
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    function resetArray() {
        numSkyscrapers = parseInt(item_count_input.value);  //get the value of the item count options
        speed = parseFloat(speed_input.value); //get the value of the speed input

        cancelSorting = true; // Cancel any ongoing sorting

        //making the backround of canvas morning
        canvas.style.background = "linear-gradient(to bottom,rgba(0, 0, 0, 0.082),rgba(0, 0, 0, 0.782)), url('bg-sun.jpg');"
        canvas.style.backgroundSize = 'cover';
        canvas.style.backgroundPosition = 'bottom';
        generateArray();
        drawArray();
    }
    
    // Helper function to pause execution for visualization
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    return {
        setSkyscraperImages,
        generateArray,
        drawArray,
        swap,
        resetArray,
        sleep
    }
})();

const Sorting = (function() {
    //this function is async because of the await e.g. (await Init.sleep(speed);)
    async function visualizeBubbleSort() {
        sortingInProgress = true;
        cancelSorting = false;
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array.length - i - 1; j++) {
                //this if statement will stop the sorting if the user click the randomize (required)
                if (cancelSorting) {
                    sortingInProgress = false;
                    return;
                }
                // Highlight the skyscrapers being compared
                array[j].state = 'comparing';
                array[j + 1].state = 'comparing';

                //Init.drawArray is called again to highlight the item while comparing in the canvas
                Init.drawArray();
                await Init.sleep(500); // speed of visualization (milliseconds)
    
                if (array[j].height > array[j + 1].height) {
                    // Highlight the skyscrapers being swapped
                    array[j].state = 'swapping';
                    array[j + 1].state = 'swapping';

                    //Init.drawArray is called again to highlight the item while swapping in the canvas
                    Init.drawArray();
                    await Init.sleep(speed); //how quick the swapping
    
                    Init.swap(array, j, j + 1);
                }
    
                // Reset states
                array[j].state = 'default';
                array[j + 1].state = 'default';
            }
    
            // Mark the last sorted element
            array[array.length - i - 1].state = 'sorted';
            Init.drawArray();
        }
    
        //this is the end of sorting
        // Mark all elements as sorted
        array.forEach(skyscraper => skyscraper.state = 'sorted');
        Init.drawArray();
        sortingInProgress = false;

        //making the background of canvas night
        canvas.style.background = "url('night-bg.jpg')"
        canvas.style.backgroundSize = 'cover';
        canvas.style.backgroundPosition = 'bottom';
    }

    //this function is async because of the await e.g. (await Init.sleep(speed);)
    async function visualizeSelectionSort() {
        sortingInProgress = true;
        cancelSorting = false;
        for (let i = 0; i < array.length; i++) {
            let minIdx = i;
            for (let j = i + 1; j < array.length; j++) {
                //this if statement will stop the sorting if the user click the randomize (required)
                if (cancelSorting) {
                    sortingInProgress = false;
                    return;
                }
                // Highlight the skyscrapers being compared - just like in bubble sort
                array[j].state = 'comparing';
                array[minIdx].state = 'comparing';
                Init.drawArray();
                await Init.sleep(500); // Adjust speed of visualization (milliseconds)
    
                if (array[j].height < array[minIdx].height) {
                    minIdx = j;
                }
    
                // Reset states
                array[j].state = 'default';
                array[minIdx].state = 'default';
            }
    
            if (minIdx !== i) {
                // Highlight the skyscrapers being swapped
                array[i].state = 'swapping';
                array[minIdx].state = 'swapping';
                Init.drawArray();
                await Init.sleep(speed);
    
                Init.swap(array, i, minIdx);
            }
    
            // Mark the sorted element
            array[i].state = 'sorted';
            Init.drawArray();
        }
    
        //this is the end of sorting
        // Mark all elements as sorted
        array.forEach(skyscraper => skyscraper.state = 'sorted');
        Init.drawArray();
        sortingInProgress = false;

        //making the background of the canvas morning
        canvas.style.background = "url('night-bg.jpg')"
        canvas.style.backgroundSize = 'cover';
        canvas.style.backgroundPosition = 'bottom';
    }

    async function visualizeInsertionSort() {
        alert("Code for insertion sort");
        //ALGORITHM FOR INSERTION SORT;
    }

    return {
        visualizeBubbleSort,
        visualizeSelectionSort,
        visualizeInsertionSort
    }
})();

//this main function will be executed after the page load
function main() {
    //this function adds an images to the array to display it in the canvas
    Init.setSkyscraperImages();

    //adding click event to the randomize button
    randomize_btn.addEventListener('click', Init.resetArray);
    
    //adding click event to the start sorting button
    start_btn.addEventListener('click', () => {
        numSkyscrapers = parseInt(item_count_input.value); //getting the value of number of items field and convert it into int
        speed = parseInt(speed_input.value); //getting the value of speed field and convert it into int
        let sort_type = sort_type_select.value; ////getting the value of sorting type dropdown and convert it into int

        //this switch statement will execute an algorithm function based on the value of sorting type dropdown
        switch(sort_type) {
            case 'bubble':
                Sorting.visualizeBubbleSort();
                break;

            case 'selection':
                Sorting.visualizeSelectionSort();
                break;
            case 'insertion':
                Sorting.visualizeInsertionSort();
                break;
        }
    })

    //if the value of number of items field is change by the user on type, the canvas will be updated
    item_count_input.addEventListener('keyup', Init.resetArray);

    //after loading and importing of all the images, it will generate a random array and display it in the canvas
    Promise.all(skyscraperImages.map(img => new Promise(resolve => {
        img.onload = resolve;
    }))).then(() => {
        speed_input.value = '1000';
        item_count_input.value = '10';

        Init.resetArray();
        Init.generateArray();
        Init.drawArray();
    });
}

main();
