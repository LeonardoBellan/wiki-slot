document.addEventListener("DOMContentLoaded", async () => {
    const centralReel = document.getElementById("article-reel");
    const leftReel = document.getElementById("left-reel");
    const rightReel = document.getElementById("right-reel");

    const itemHeight = 120;

    // Fetch a random Wikipedia article
    async function fetchArticle() {
        const url =
            "https://it.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=20&prop=extracts|info&inprop=url&exintro=1&explaintext=1&format=json&origin=*";

        // Words used to filter out boring articles
        const boringWords = ["comune"];

        // Keep fetching until a valid article is found
        while (true) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                const pages = Object.values(data.query.pages);
                for (const page of pages) {
                    console.log(page);

                    const intro = page.extract
                        ? page.extract.toLowerCase()
                        : "";
                    const isBoring = boringWords.some((word) =>
                        intro.includes(word),
                    );
                    const isList =
                        page.title.startsWith("Lista di") ||
                        page.title.startsWith("Episodi di");

                    if (!isBoring && !isList) return page;
                }
            } catch (error) {
                console.error("Error during fetch:", error);
                return null;
            }
        }
    }

    // Populate a reel with items and start spinning
    function initAndSpinReel(reelElement, itemsArray) {
        itemsArray.forEach((text) => {
            const li = document.createElement("li");
            li.innerHTML = text; // InnerHTML in order to use elements for styling
            reelElement.appendChild(li);
        });
        reelElement.classList.add("spinning");
    }

    // Stop a reel on the winning item
    function stopReel(reelElement, totalPlaceholders, winnerContent) {
        // Add the winning item at the end of the reel
        const winnerArticle = document.createElement("li");
        winnerArticle.classList.add("winner");
        winnerArticle.innerHTML = winnerContent;
        reelElement.appendChild(winnerArticle);

        // Remove the infinite spin class
        reelElement.classList.remove("spinning");

        // Reset position to prepare for the braking animation
        reelElement.style.transition = "none";
        reelElement.style.transform = "translateY(0px)";

        // Force browser reflow
        void reelElement.offsetWidth;

        // Apply braking animation
        reelElement.style.transition = "";
        reelElement.classList.add("braking");

        // Calculate final position and scroll
        const targetY = -(totalPlaceholders * itemHeight);
        reelElement.style.transform = `translateY(${targetY}px)`;
    }

    // --- INITIAL SETUP ---

    const placeholderArticles = [
        "Articolo 1",
        "Articolo 2",
        "Articolo 3",
        "Articolo 4",
        "Articolo 5",
        "Articolo 6",
        "Articolo 7",
        "Articolo 8",
        "Articolo 9",
        "Articolo 10",
        "Articolo 1",
    ];

    // Filler items for the side reels (e.g., 11 "BAR" items)
    const fillerItems = Array(11).fill("-----");

    // Start spinning all three reels
    initAndSpinReel(leftReel, fillerItems);
    initAndSpinReel(centralReel, placeholderArticles);
    initAndSpinReel(rightReel, fillerItems);

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Wait for fetch completion and minimum spin time
    const [winnerContent] = await Promise.all([fetchArticle(), wait(3500)]);
    const centralWinnerText = winnerContent
        ? `<a href="${winnerContent.fullurl}" class="article-link">${winnerContent.title}</a>`
        : "Network Error";

    // Winning text for side reels
    const sideWinnerText = "-----";

    // --- SEQUENTIAL BRAKING ---

    // Stop left reel
    stopReel(leftReel, fillerItems.length, sideWinnerText);

    // Wait 500ms, then stop center reel
    await wait(500);
    stopReel(centralReel, placeholderArticles.length, centralWinnerText);

    // Wait 500ms, then stop right reel
    await wait(500);
    stopReel(rightReel, fillerItems.length, sideWinnerText);
});
