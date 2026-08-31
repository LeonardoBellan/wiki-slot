document.addEventListener("DOMContentLoaded", async () => {
    const reel = document.getElementById("reel");
    const itemHeight = 100;

    async function fetchArticle() {
        const url =
            "https://it.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=20&prop=extracts&exintro=1&explaintext=1&format=json&origin=*";

        // Words/Phrases used to filter articles
        const boringWords = [
            "comune",
            "frazione",
            "villaggio",
            "asteroide",
            "insetto",
        ];

        // Fetch until valid article
        while (true) {
            try {
                const response = await fetch(url);
                const data = await response.json();

                const pages = Object.values(data.query.pages);
                // Search for valid page
                for (const page of pages) {
                    const intro = page.extract
                        ? page.extract.toLowerCase()
                        : "";
                    const isBoring = boringWords.some((word) =>
                        intro.includes(word),
                    );
                    const isList =
                        page.title.startsWith("Lista di") ||
                        page.title.startsWith("Episodi di");

                    if (!isBoring && !isList) {
                        return page;
                    }
                }
            } catch (error) {
                console.error("Errore nel recupero API:", error);
                return null;
            }
        }
    }

    // Setup placeholder items
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
        "Articolo 1", // Repeat n.1 for looping animation
    ];

    let spinHTML = "";
    placeholderArticles.forEach((title) => {
        spinHTML += `<li>${title}</li>`;
    });
    reel.innerHTML = spinHTML;

    // Reel spin animation and article searching
    reel.classList.add("spinning");

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const [articleWinner] = await Promise.all([fetchArticle(), wait(3500)]);

    // Braking
    let brakeHTML = "";
    placeholderArticles.forEach((title) => {
        brakeHTML += `<li>${title}</li>`;
    });

    brakeHTML += `<li class="winner" style="font-weight: bold; color: gold;">`;
    brakeHTML += articleWinner ? articleWinner.title : "Errore di ricerca";
    brakeHTML += `</li>`;
    reel.innerHTML = brakeHTML;

    reel.classList.remove("spinning");

    reel.style.transition = "none";
    reel.style.transform = "translateY(0px)";
    void reel.offsetWidth;
    reel.style.transition = "";
    reel.classList.add("braking");

    const targetY = -(placeholderArticles.length * itemHeight);
    reel.style.transform = `translateY(${targetY}px)`;
});
