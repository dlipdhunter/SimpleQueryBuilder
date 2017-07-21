var targetElem = document.getElementById("query");
var suggestionElem = document.getElementById("suggestion");
var fields = [
    { field: "Id", type: "number", name: "Identifier" },
    { field: "Name", type: "string", name: "Name" }
];

var qBuilder = new SimpleQueryBuilder(targetElem, suggestionElem, fields);
