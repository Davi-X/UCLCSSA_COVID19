let allHist_fig = [];
let confirmed_hist = [];
let death_hist = [];
let recovery_hist = [];
let tested_hist = [];
allHist_fig[0] = confirmed_hist;
allHist_fig[1] = death_hist;
allHist_fig[2] = recovery_hist;
allHist_fig[3] = tested_hist;

let death_map = new Map();
let recovery_map = new Map();
let regional_data = new Map();

let UK_data = [];
let overview = new Map();
let region_data= new Map();
UK_data[0] = overview;
UK_data[1] = region_data;
const keys = ["confirmed","tested","cured","death","england","wales","scotland","nireland"];

$(document).ready(function(){
    $.getJSON("https://api.covid19uk.live/", function(result){
        // For overview and region data
        const data = result.data;
        let regionJSON = JSON.parse(data[0].area.replace(/\\/g, ''));
        keys.forEach(key => {overview.set(key, data[0][key])});
        overview.set("cured",data[1].cured);

        regionJSON.forEach(place => {
            if (place.number != null)
            {
                if (place.number.toString().includes(','))
                    place.number = place.number.replace(/,/g, '');                
                region_data.set(place.location.trim(), parseInt(place.number.toString().trim()));
            }
        });
        regional_data = region_data;

        //  Insert Overview data
        keys.forEach(key => {document.getElementById(key).innerHTML = overview.get(key);});
        function replaceOverall()
        {
            // Insert Region data
            for (let key of region_data.keys())
            {
                let color = 'black';
                if (region_data.get(key) < 50)
                    color = 'springgreen';
                else if (region_data.get(key) > 200) 
                    color = 'gold'
                if (region_data.get(key) > 500)
                    color = 'red';
                let regionHTML = '<div class="external-html">' + 
                                    '<div class="regionContainer">' + 
                                        '<div class="row">' + 
                                            '<div class="col-9">' + 
                                                '<span class="region" style="font-size : 20px; font-family: \'Trocchi\', serif; padding-left: 5px;">' + key + '</span>' + 
                                            '</div>' + 
                                            '<div class="col-3">' + 
                                                '<span class="region-number" style="font-size : 20px; font-family: \'Trocchi\', serif; color :' + color + ';">' + region_data.get(key) + '</span>' + 
                                            '</div>' + 
                                        '</div>' + 
                                    '</div>' + 
                                    '<hr>' + 
                                '</div>';
                document.getElementById("feature-list").innerHTML += regionHTML;
            }
        }
        replaceOverall();
      });
});
let xhttp = null;
function getreqGrapData(){
    if(xhttp) xhttp.abort();
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(xhttp.responseText).data;
            for (i in data)
            {
                confirmed_hist[i] = data[i].confirmed;
                death_hist[i] = data[i].death;
                recovery_hist[i] = data[i].cured;
                tested_hist[i] = data[i].negative + confirmed_hist[i];
            }
        }
    };
    xhttp.open("GET", "https://api.covid19uk.live/historyfigures", false);
    xhttp.send();
}
getreqGrapData();

function getDailyData(hist_fig){
    return hist_fig[hist_fig.length - 1] - hist_fig[hist_fig.length - 2];
}
for (i = 0; i < document.getElementsByClassName("daily-increase").length; i++)
    document.getElementsByClassName("daily-increase")[i].innerHTML = '+' + getDailyData(allHist_fig[i]);   

function getDates(startDate, stopDate) {
    let dateArray = new Array();
    let currentDate = startDate;
    while (currentDate <= stopDate) {
        currentDate = new Date(currentDate);
        dateArray.push(currentDate.toString());
        currentDate = currentDate.setDate(currentDate.getDate() + 1);
   }
   return dateArray;
 }

let alldates = getDates(new Date("2020-01-31"),new Date());
// Set Map for death and recovery
for (i in alldates)
{
    death_map.set(alldates[i], death_hist[i]);
    recovery_map.set(alldates[i], recovery_hist[i])
}

// --------------------------------------------------------------------------------------------------
var configHist = {
    series: [{
        name: "总确诊",
        data: confirmed_hist.slice(-14)
    },
    {
        name: "总死亡",
        data: death_hist.slice(-14)
    }],
    chart: {
        id : 'confirmed and death hist',
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
    },
    colors: ['#3d0707', '#ff0000'],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    title: {
        text: '确诊及死亡',
        align: 'left'
    },
    grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
    xaxis: {
        type: 'datetime',
        categories: alldates.slice(-14),
        labels: {
            format : "dd/MM",
            rotate: -10
        }
    }
};
var chart1 = new ApexCharts(document.getElementById("UK_history_confirmed"), configHist);
chart1.render();

document.getElementById("7-day-1").addEventListener("click", function(){
    chart1.updateSeries([{
            name : "总确诊",
            data : confirmed_hist.slice(-7)
        },
        {
            name : "总死亡",
            data : death_hist.slice(-7)
        }
    ])
    ApexCharts.exec('confirmed and death hist', "updateOptions", {
        xaxis : {
            categories: alldates.slice(-7)
        },
        dataLabels: {
            enabled: true
        }
    });
})

document.getElementById("2-week-1").addEventListener("click", function(){
    chart1.updateSeries([{
            name : "总确诊",
            data : confirmed_hist.slice(-14)
        },
        {
            name : "总死亡",
            data : death_hist.slice(-14)
        }
    ])
    ApexCharts.exec('confirmed and death hist', "updateOptions", {
        xaxis : {
            categories: alldates.slice(-14)
        },
        dataLabels: {
            enabled: false
        }
    });
})

document.getElementById("all-1").addEventListener("click", function(){
    chart1.updateSeries([{
            name : "总确诊",
            data : confirmed_hist
        },
        {
            name : "总死亡",
            data : death_hist
        }
    ])
    ApexCharts.exec('confirmed and death hist', "updateOptions", {
        xaxis : {
            categories: alldates
        },
        dataLabels: {
            enabled: false
        }
    });
})

// --------------------------------------------------------------------------------------------------

let daily_death = [];
for (i in death_hist)
{
    if (i == 0)
        daily_death[i] = death_hist[0]
    else
        daily_death[i] = death_hist[i] - death_hist[i - 1];
}

var configDaily = {
    series: [{
        name: "单日死亡病例",
        data: death_hist.slice(-14)
    }],
    chart: {
        id : 'daily death hist',
        height: 350,
        type: 'bar',
        zoom: {
          enabled: false
        }
    },
    colors: ['#ff0000'],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    title: {
        text: '单日死亡病例',
        align: 'left'
    },
    grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
    xaxis: {
        type: 'datetime',
        labels:{
            format: "dd/MM"
        },
        categories: alldates.slice(-14)
    }
};
var chart2 = new ApexCharts(document.getElementById("UK_daily_death"), configDaily);
chart2.render();

document.getElementById("7-day-2").addEventListener("click", function(){
    chart2.updateSeries([{
            name : "单日死亡病例",
            type: 'column',
            data : daily_death.slice(-7)
        }
    ])
    ApexCharts.exec('daily death hist', "updateOptions", {
        xaxis : {
            categories: alldates.slice(-7)
        },
        dataLabels: {
            enabled: true
        }
    });
})

document.getElementById("2-week-2").addEventListener("click", function(){
    chart2.updateSeries([{
            name : "单日死亡病例",
            type: 'column',
            data : daily_death.slice(-14)
        }
    ])
    ApexCharts.exec('daily death hist', "updateOptions", {
        xaxis : {
            categories: alldates.slice(-14)
        },
        dataLabels: {
            enabled: false
        }
    });
})

document.getElementById("all-2").addEventListener("click", function(){
        chart2.updateSeries([{
            name : "单日死亡病例",
            data : daily_death
        }
    ])
    ApexCharts.exec('daily death hist', "updateOptions", {
        xaxis : {
            categories: alldates
        },
        dataLabels: {
            enabled: false
        }
    });
})

// --------------------------------------------------------------------------------------------------

let active_hist = [];
for(i in confirmed_hist)
    active_hist[i] = confirmed_hist[i] - recovery_hist[i];

var configActive = {
    series: [{
        name: "已确诊未被治愈",
        data: active_hist
    }],
    chart: {
        id : 'daily death hist',
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
    },
    colors: ['#ff0000'],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    title: {
        text: '已确诊未被治愈',
        align: 'left'
    },
    grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
    xaxis: {
        type: 'datetime',
        labels:{
            format: "dd/MM"
        },
        categories: getDates(new Date("2020-01-31"), new Date()),
    }
};
var active_chart = new ApexCharts(document.getElementById("UK_active"), configActive);
active_chart.render();

// --------------------------------------------------------------------------------------------------

let death_rate = [];
let recovery_rate = [];
let death_rate_map = new Map();
let recovery_rate_map = new Map(); 
let rateDates = [];
for (i in alldates)
{
    if (death_hist[i] != 0)
    {
        death_rate.push((death_hist[i] / confirmed_hist[i] * 100).toPrecision(4));
        death_rate_map.set(alldates[i], death_hist[i] / confirmed_hist[i]);
    }
        
    if (recovery_hist[i] != 0)
    {
        recovery_rate.push((recovery_hist[i] / confirmed_hist[i] * 100).toPrecision(4));
        recovery_rate_map.set(alldates[i], recovery_hist[i] / confirmed_hist[i]);
    }
    if (death_hist[i] != 0 || recovery_hist[i] != 0)
        rateDates.push(alldates[i])
}
        

var config3 = {
    series: [{
        name: "recovery rate",
        data: recovery_rate
    },
    {
        name: "death rate",
        data: death_rate
    }],
    chart: {
        id : 'rates',
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
    },
    colors: ['#3d0707', '#ff0000'],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    title: {
        text: '治疗及死亡率',
        align: 'left'
    },
    grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
    xaxis: {
        type: 'datetime',
        labels:{
            format: "dd/MM"
        },
        categories: rateDates
    }
};
var rateschart = new ApexCharts(document.getElementById("UK_rates"), config3);
rateschart.render();

function updateRegionalData(map){
    let iterkeys = map.keys();
    let itervals = map.values();
    for (i = 0; i < map.size; i++)
    {
        let value = itervals.next().value;
        let color = 'black';
        if (value < 50)
            color = 'springgreen';
        else if (value > 200) 
            color = 'gold'
        if (value > 500)
            color = 'red';
        document.getElementsByClassName("region")[i].innerHTML = iterkeys.next().value;
        document.getElementsByClassName("region")[i].style.color = color;
        document.getElementsByClassName("region-number")[i].innerHTML = value;
        document.getElementsByClassName("region-number")[i].style.color = color;
    }
}
document.getElementById("alph-button").addEventListener("click", function(){
    let keys = [];
    for (let key of regional_data.keys())
        keys.push(key);
    keys.sort();
    temp_map = new Map();
    for (key of keys)
        temp_map.set(key, regional_data.get(key));
    regional_data.clear();
    regional_data = temp_map;
    updateRegionalData(regional_data);
})
document.getElementById("num-button").addEventListener("click", function(){
    regional_data = new Map([...regional_data.entries()].sort((a, b) => b[1] - a[1]));
    updateRegionalData(regional_data);
})