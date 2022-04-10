const ordredList = document.querySelector("#listCountries");
var ctx = document.getElementById('myChart').getContext('2d');

const countriesList = async () => {

    const promise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.covid19api.com/countries");

        xhr.addEventListener("readystatechange", (e) => {
            //console.log("done");
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                resolve(xhr.response);
            } else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200)
                reject('Une erreur est survenue !\n\nCode :' + xhr.status + '\nTexte : ' + xhr.statusText);
        });

        xhr.send();

    });

    return promise;
};

const countryCovidInfo = async (country) => {

    const promise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.covid19api.com/dayone/country/" + country.trim());

        xhr.addEventListener("readystatechange", (e) => {
            // console.log("done");
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                resolve(xhr.response);
            } else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200)
                reject('Une erreur est survenue !\n\nCode :' + xhr.status + '\nTexte : ' + xhr.statusText);
        });

        xhr.send();

    });
    return await promise;
};

const changeChart = (contenu, title) => {
    // console.log(contenu);
    var data = {
        labels: contenu.date,
        datasets: [{
            label: 'Confirmés',
            data: contenu.confirmes,
            backgroundColor: 'rgba(0, 0, 255,.3)',
            pointBackgroundColor: 'rgba(0, 0, 255,.3)',
            PointBorderColor: 'rgba(0, 0, 255,.5)',
            fill: true,
            borderColor: 'blue',
            borderWidth: 2
        }, {
            label: 'Guéris',
            data: contenu.guris,
            backgroundColor: 'rgba(21, 250, 21,.5)',
            fill: true,
            borderColor: 'green',
            borderWidth: 2
        }, {
            label: 'Decés',
            data: contenu.deces,
            backgroundColor: 'rgba(255, 0, 0,.7)',
            fill: true,
            borderColor: 'red',
            borderWidth: 2
        }, {
            label: 'Active',
            data: contenu.active,
            backgroundColor: ' rgba(255, 255, 0,.7)',
            fill: true,
            borderColor: 'yellow',
            borderWidth: 2
        }]
    };

    var myChart = new Chart(ctx, {
        type: 'line',

        data: data,
        options: {
            title: {
                display: true,
                text: title,
                position: 'bottom'
            }
        }
    });

    return myChart;

};


(function () {
    var chart = null;
    countriesList()
        .then((reponse) => {
            const result = JSON.parse(reponse);
            result.forEach(element => {
                ordredList.innerHTML += `<li name="${element.Country}" >${element.Country}</li>`;
            });
            ordredList.childNodes.forEach(element => {
                if (element.nodeType === Node.ELEMENT_NODE) {
                    element.addEventListener("click", (e) => {
                        countryCovidInfo(e.target.getAttribute('name'))
                            .then((reponse) => {
                                let contenu = {
                                    confirmes: [],
                                    guris: [],
                                    deces: [],
                                    active: [],
                                    date: []
                                }
                                const result = JSON.parse(reponse);
                                let i = 0;
                                let date = null;
                                if (result.length > 0) {
                                    result.forEach(element => {
                                        contenu.confirmes.push(element.Confirmed);
                                        contenu.guris.push(element.Recovered);
                                        contenu.deces.push(element.Deaths);
                                        contenu.active.push(element.Active);
                                        date = new Date(element.Date);
                                        contenu.date.push(date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear());
                                    });
                                    if (chart !== null)
                                        chart.destroy();
                                    chart = changeChart(contenu, e.target.getAttribute('name'));
                                } else
                                    alert("les informations rolative a paye " + e.target.getAttribute('name') + " n'est pas encore disponible ");

                            })
                            .catch((error) => { console.log(error) });

                    });
                    element.addEventListener('mouseover', (e) => {
                        e.stopPropagation();
                        e.target.classList.add('decoreElement');
                    });
                    element.addEventListener('mouseout', (e) => {
                        e.stopPropagation();
                        e.target.classList.remove('decoreElement');
                    });
                }
            });
        })
        .catch((error) => { console.log(error) });
})();