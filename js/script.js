// ==========================================
// RDW OPEN DATA API INTEGRATIE VOOR KENTEKENS
// ==========================================

document.getElementById('searchBtn').addEventListener('click', performSearch);
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

async function performSearch() {
    let query = document.getElementById('searchInput').value.trim().toUpperCase();
    
    // Verwijder streepjes/speciale tekens voor de RDW API lookup
    query = query.replace(/[^A-Z0-9]/g, '');

    const resultCard = document.getElementById('resultCard');
    const errorCard = document.getElementById('errorCard');
    const loading = document.getElementById('loading');

    if (!query) return;

    resultCard.classList.add('hidden');
    errorCard.classList.add('hidden');
    loading.classList.remove('hidden');

    setTimeout(async () => {
        loading.classList.add('hidden');

        try {
            // RDW Open Data Endpoint voor voertuigen op kenteken
            const response = await fetch(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${query}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const vehicle = data[0];
                
                // Formatteer het kenteken weer netjes met streepjes
                const formattedPlate = formatLicensePlate(query);

                displayResult(formattedPlate, {
                    model: `${vehicle.merk || 'Onbekend'} ${vehicle.handelsbenaming || ''}`.trim(),
                    type: vehicle.inrichting || 'Personenauto',
                    fuel: vehicle.brandstof_omschrijving || 'Onbekend',
                    apk: formatDate(vehicle.vervaldatum_apk) || 'Onbekend',
                    status: 'Geregistreerd in RDW'
                });
            } else {
                errorCard.classList.remove('hidden');
                document.getElementById('errorText').innerText = `Geen voertuig gevonden voor kenteken: ${query}`;
            }
        } catch (err) {
            errorCard.classList.remove('hidden');
            document.getElementById('errorText').innerText = `Fout bij opzoeken of geen verbinding met RDW database.`;
        }
    }, 400);
}

function displayResult(plate, data) {
    document.getElementById('resPlate').innerText = plate;
    document.getElementById('resModel').innerText = data.model;
    document.getElementById('resType').innerText = data.type;
    document.getElementById('resFuel').innerText = data.fuel;
    document.getElementById('resApk').innerText = data.apk;
    document.getElementById('resStatus').innerText = data.status;

    document.getElementById('resultCard').classList.remove('hidden');
}

// Hulpfunctie om RDW datumnotatie (YYYYMMDD) om te zetten naar DD-MM-YYYY
function formatDate(dateString) {
    if (!dateString || dateString.length !== 8) return dateString;
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}-${month}-${year}`;
}

// Hulpfunctie om Nederlandse kentekens van streepjes te voorzien
function formatLicensePlate(plate) {
    if (plate.length !== 6) return plate;
    return `${plate.substr(0,2)}-${plate.substr(2,2)}-${plate.substr(4,2)}`;
}
