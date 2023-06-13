/*
@overview Adds Code 128 barcodes to csv data using https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/barcodes/JsBarcode.code128.min.js
(licensed under the MIT license https://github.com/lindell/JsBarcode/blob/master/MIT-LICENSE.txt)
@version 2.2
@author Tobias Bielander
*/

const parameters = {
    separator: {
        name: "separator",
        spanID: "separator",
        source: {
            id: "separator-dropdown",
            type: "dropdown-list",
            options: {
                labels: {
                    Tabulator: "\t",
                    Semikolon: ";",
                    Komma: ","
                },
                defaultValue: "\t"
            }
        }
    },
    columnToEncode: {
        name: "columnToEncode",
        spanID: "column-to-encode",
        source: {
            id: "column-to-encode-dropdown",
            type: "dropdown-list",
            options: {
                labels: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                defaultValue: 0
            }
        }
    },
    barcodeColumn: {
        name: "barcodeColumn",
        spanID: "barcode-column",
        source: {
            id: "barcode-column-dropdown",
            type: "dropdown-list",
            options: {
                labels: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                defaultValue: 1
            }
        }
    },
    prefix: {
        name: "prefix",
        spanID: "prefix",
        source: {
            id: "prefix-dropdown",
            type: "dropdown-list",
            options: {
                labels: {
                    "[Ohne Präfix]": "[Ohne Präfix]",
                    "BAU_": "BAU_"
                },
                defaultValue: "BAU_"
            } 
        }
    }
};

/* create dropdowns */

function appendDropdownItems(span, type, options, dropdownDIV) {
    var ul = document.createElement("ul");
    ul.className = type;
    var list = function (option) {
        var li = document.createElement("li");
            var textNode = document.createTextNode(option);
            li.appendChild(textNode);
            li.onclick = function() {updateInnerText(option, span, "input")};
            ul.appendChild(li);
    };
    if (typeof(options) === "string") {
        for (let opt of options) { list(opt); }
    } else {
        for (let opt in options) { list(opt); }
    }
    if (span === "prefix") {
        var inputListItem = document.createElement("li");
        inputListItem.id = "input-list-item";
        inputListItem.innerHTML = "<input id='prefix-input' type='text' placeholder='Präfix eingeben + ENTER'/>";
        inputListItem.onkeydown = function (e) {
            if (e.key === "Enter") {
                var prefixInput = document.getElementById("prefix-input").value;
                updateInnerText(prefixInput, span, "input");
            }
        }
        ul.appendChild(inputListItem);
    }
    dropdownDIV.appendChild(ul);
}

function createDropdowns() {
    for (let i in parameters) {
        var param = parameters[i];
        var spanID = param.spanID;
        var sourceType = param.source.type;
        if (sourceType === "dropdown-list") {
            var sourceID = param.source.id;
            var labels = param.source.options.labels;
            var dropdown = document.getElementById(sourceID);
            appendDropdownItems(spanID, sourceType, labels, dropdown);
        } else {
            continue;
        } 
    }
}

/* toggles */

function toggleMode() {
    if (mode === "simple") {
        mode = "extended";
    } else {
        mode = "simple";
    }
    localStorage.setItem("mode", mode);
    settings = readSettings(mode);
    var extendedMode = document.getElementById("extended-mode");
    extendedMode.classList.toggle("hidden");
    var infoBox = document.getElementById("info-box");
    infoBox.classList.add("hidden");
    toggleGeneratorButton(mode);
    toggleConfigMouseover(mode);
    toggleInfoContent(mode);
}

function toggleGeneratorButton(mode) {
    var simpleModeButton = document.getElementById("generate-barcodes-simple");
    if (mode === "simple") {
        simpleModeButton.classList.remove("hidden");
    } else {
        simpleModeButton.classList.add("hidden");
    }
}

function toggleInfoBox() {
    var infoBox = document.getElementById("info-box");
    infoBox.classList.toggle("hidden");
}

function toggleInfoContent(mode) {
    var simpleModeInfo = document.getElementById("simple-mode-info");
    var extendedModeInfo = document.getElementById("extended-mode-info");
    if (mode === "simple") {
        extendedModeInfo.classList.add("hidden");
        simpleModeInfo.classList.remove("hidden");
    } else {
        simpleModeInfo.classList.add("hidden");
        extendedModeInfo.classList.remove("hidden");
    }
}

function toggleConfigMouseover(mode) {
    var gear = document.getElementById("configuration");
    var hoverText = {
        simple: "Zum erweiterten Modus wechseln",
        extended: "Zum einfachen Modus wechseln"
    }
    gear.setAttribute("title", hoverText[mode]);
}

/* get configuration */

function getMode() {
    var storedMode = localStorage.getItem("mode");
    if (storedMode === "extended") {
        var extendedMode = document.getElementById("extended-mode");
        extendedMode.classList.remove("hidden");
        return storedMode;
    } else {
        return "simple";
    }
}

/* read settings */

function getDefault() {
    var defaultSettings = {};
    for (let i in parameters) {
        var param = parameters[i];
        var value = param.source.options.defaultValue;
        defaultSettings[i] = value;
    }
    return defaultSettings;
}

function getLabel(val) {
    var lookup = {
        "\t": "Tabulator",
        ";": "Semikolon",
        ",": "Komma"
    };
    if (val in lookup) {
        return lookup[val];
    } else if (0 <= val && val <= 25) {
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[val];
    } else {
        return val;
    }
}

function readSettings(mode) {
    var storedSettings = getDefault();
    if (mode === "extended") {
        for (let key in storedSettings) {
            var value = localStorage.getItem(key);
            if (value) {
                storedSettings[key] = value;
                for (let i in parameters) {
                    var param = parameters[i];
                    if (key === param.name) {
                        var label = getLabel(value);
                        updateInnerText(label, param.spanID, "localStorage");
                    }
                }
            } else {
                continue;
            }
        }
    }   
    return storedSettings;
}

/* write settings */

function writeSettings(text, span) {
    for (let i in parameters) {
        var param = parameters[i];
        if (param.spanID === span) {
            if (param.name == "separator") {
                var value = param.source.options.labels[text];
            } else if (param.name == "prefix") {
                var value = text;
            } else {
                var value = param.source.options.labels.indexOf(text);
            }
            localStorage.setItem(param.name, value);
        }
    }
}

function updateInnerText(txt, spanID, source) {
    var span = document.getElementById(spanID);
    span.innerText = txt;
    if (source === "input") {
        writeSettings(txt, spanID);
    }   
}

/* manage messages */

function showMessage(msg, type) {
    var msgDIV = document.createElement("div");
    msgDIV.classList.add(type);
    msgDIV.innerHTML = msg;
    document.body.appendChild(msgDIV);
}

function hideOnPrint(classes) {
    window.onbeforeprint = function () {
        classes.forEach(function (className) {
            var messagesToHide = document.getElementsByClassName(className);
            if (messagesToHide.length > 0) {
                for (let div of messagesToHide) {
                    div.classList.add("hidden");
                }
            }
        })
    };
    window.onafterprint = function () {
        classes.forEach(function (className) {
            var messagesToHide = document.getElementsByClassName(className);
            if (messagesToHide.length > 0) {
                for (let div of messagesToHide) {
                    div.classList.remove("hidden");
                }
            }
        })
    };
}

function clearMessage(classes) {
    classes.forEach(function (className) {
        var obsoleteMessages = document.getElementsByClassName(className);
        if (obsoleteMessages.length > 0) {
            for (let div of obsoleteMessages) {
                div.remove();
            }
        }
    });  
}

/* create HTML table with svg barcodes */

function insertBarcodes(table, mode) {
    settings = readSettings(mode);
    for (let i = 0; i < table.length; i++) {
        if (table[i][settings.barcodeColumn] === "") {
            var startingRow = i;
            break;
        } else {
            var startingRow = table.length;
        }
    }
    if (startingRow === table.length) {
        var occupiedColumn = getLabel(settings.barcodeColumn);
        var warning = `<p>Der Barcode-Generator hat in Spalte ${occupiedColumn} keine leeren Zellen zur Einfügung der Barcodes gefunden.</p>`;
        clearMessage(["no-input-warning"]);
        showMessage(warning, "column-warning");
        return table;
    }
    var headPlusAnchorTitle = table.slice(0, startingRow);
    var attachedTitles = table.slice(startingRow);
    attachedTitles.forEach(function (row) {
        if (row[settings.columnToEncode]) {
            if (settings.prefix === "[Ohne Präfix]") {
                var barcodeText = row[settings.columnToEncode];
            } else {
                var barcodeText = settings.prefix + row[settings.columnToEncode];
            }
            var svgBarcode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgBarcode.classList.add("barcode");
            svgBarcode.setAttribute("jsbarcode-value", barcodeText)
            row[settings.barcodeColumn] = svgBarcode;
        }
    });
    return headPlusAnchorTitle.concat(attachedTitles);
}

function appendRow(rowData, element) {
    var row = document.createElement("tr");
    rowData.forEach(function (cellData) {
        var cell = document.createElement("td");
        if (typeof cellData === "string") {
            cell.appendChild(document.createTextNode(cellData));
        } else {
            cell.appendChild(cellData);
        }
        row.appendChild(cell);
    });
    element.appendChild(row);
}

function createTable(tableData) {
    var htmlTable = document.createElement("table");
    var htmlTableHead = document.createElement("thead");
    var htmlTableBody = document.createElement("tbody");

    var tableInfo = '<p>Die unten stehende Barcode-Tabelle können Sie über das Druckmenü des Browsers als PDF speichern oder ausdrucken. Empfohlene Druckeinstellungen:</p>' +
                    '<ol>' +
                    '<li>Ziel: Als PDF speichern.</li>' +
                    '<li>In den meisten Fällen empfiehlt sich das Hochformat. Wählen Sie das Querformat, wenn die Tabelle zu breit ist oder die Barcodes nicht eingelesen werden können.</li>' +
                    '<li>Option "Kopf- und Fußzeilen drucken" deaktivieren.</li>' +
                    '<li>Option "Hintergrund drucken" aktivieren, um die Kopfzeile hervorzuheben.</li>' +
                    '</ol>' +
                    '<p><strong>&#9432;</strong> Um zum Barcode-Generator zurückzukehren, laden Sie diese Seite neu.</p>';

    showMessage(tableInfo, "instruction");
    var headData = tableData[0];
    appendRow(headData, htmlTableHead);
    var bodyData = tableData.slice(1);
    bodyData.forEach(row => appendRow(row, htmlTableBody));
    htmlTable.appendChild(htmlTableHead);
    htmlTable.appendChild(htmlTableBody);
    document.getElementById("header").style.display = "none";
    document.body.appendChild(htmlTable);
    JsBarcode(".barcode").init();
}

function testSeparator(str, mode) {
    clearMessage(["no-input-warning", "column-warning", "separator-warning"]);
    var warning = {

        "simple": "<p>Möglicherweise besteht ein Problem mit dem Feldtrennzeichen. " +
                  "Bitte stellen Sie sicher, dass die folgenden Voraussetzungen erfüllt sind:</p>" +
                  "<ol>" +
                  "<li>Die einzelnen Felder der CSV-Datei sind durch den Tabulator getrennt.</li>" +
                  "<li>Innerhalb der Tabellenfelder kommen keine Tabulatorzeichen vor.</li>" +
                  "</ol>" +
                  "<p>Nur wenn diese Voraussetzungen gegeben sind, werden die Tabellenspalten korrekt erkannt. " +
                  "Andernfalls ist nicht auszuschliessen, dass entweder keine oder unter Umständen falsche Barcodes erstellt werden.</p>",

        "extended": "<p>Möglicherweise besteht ein Problem mit dem Feldtrennzeichen. " +
                    "Bitte stellen Sie sicher, dass die folgenden Voraussetzungen erfüllt sind:</p>" +
                    "<ol>" +
                    "<li>Das Feldtrennzeichen der CSV-Datei und die entsprechende Einstellung des Barcode-Generators stimmen überein.</li>" +
                    "<li>Innerhalb der Tabellenfelder kommt das betreffende Feldtrennzeichen nicht vor.</li>" +
                    "</ol>" +
                    "<p>Nur wenn diese Voraussetzungen gegeben sind, werden die Tabellenspalten korrekt erkannt. " +
                    "Andernfalls ist nicht auszuschliessen, dass entweder keine oder unter Umständen falsche Barcodes erstellt werden.</p>"
    };
    var modulo = 1;
    var newlineMatch = str.match(/\n/g);
    if (newlineMatch) {
        var numberOfRows = newlineMatch.length;
        var separatorMatch = str.match(new RegExp(settings.separator, "g"));
        if (separatorMatch) {
            var separatorOccurences = separatorMatch.length;
            modulo = separatorOccurences % numberOfRows;
        }
    }
    modulo === 0 || showMessage(warning[mode], "separator-warning");
}

function readTable() {
    settings = readSettings(mode);
    if (fileInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function () {
            testSeparator(reader.result, mode);
            rowsArray = reader.result.split("\n");
            tableArray = rowsArray.map(row => row.split(settings.separator));
            tableArrayWithBarcodes = insertBarcodes(tableArray, mode);
            if (tableArrayWithBarcodes !== tableArray) {
                clearMessage(["no-input-warning", "column-warning"]); 
                createTable(tableArrayWithBarcodes);
            } else {
                console.log(tableArray);
            } 
        };
        reader.readAsText(fileInput.files[0], "utf-8");
    } else {
        showMessage("<p>Bitte wählen Sie eine CSV-Datei.</p>", "no-input-warning");
    }   
}

/* initialize barcode generator */

var mode = getMode();
var settings = readSettings(mode);
var rowsArray = [];
var tableArray = [];
var tableArrayWithBarcodes = [];
var fileInput = document.getElementById("csv");

createDropdowns();
hideOnPrint(["instruction", "separator-warning", "no-input-warning", "column-warning" ]);
toggleGeneratorButton(mode);
toggleConfigMouseover(mode);
toggleInfoContent(mode);
document.getElementById("configuration").onclick = toggleMode;
document.getElementById("info").onclick = toggleInfoBox;
document.getElementById("info-text-icon").onclick = toggleInfoBox;
document.getElementById("generate-barcodes-simple").onclick = readTable;
document.getElementById("generate-barcodes-extended").onclick = readTable;
fileInput.onchange = readTable;
