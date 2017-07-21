function SimpleQueryBuilder(targetElement, targetSuggestionElement, fields) {
    var oThis = this;
    var oStrategyTypes = Type();
    var oStrategy = null;
    var oFields = fields;
    var canDelete = false;
    oThis.targetElement = targetElement;

    oThis.getFields = function(){
        return oFields;
    }

    oThis.setStrategy = function (pType) {
        switch (pType) {
            case oStrategyTypes.Field:
                oStrategy = new FieldStrategy(oThis);
                break;
            case oStrategyTypes.Conditional:
                oStrategy = new ConditionalStrategy(oThis);
                break;
            case oStrategyTypes.Logical:
                oStrategy = new LogicalStrategy(oThis);
                break;
            default:
                break;
        }
    }

    oThis.setStrategy(oStrategyTypes.Field);
    attachEventListeners();    

    function loadSuggestions(){
        var suggestionList = oStrategy.getSuggestions();        
        createSuggestionList(suggestionList);
    }

    function createSuggestionList(pSuggestionList) {
        while (targetSuggestionElement.hasChildNodes()) {
            targetSuggestionElement.removeChild(targetSuggestionElement.lastChild);
        }
        
        var ulElem = document.createElement("UL");
        for (var index = 0; index < pSuggestionList.length; index++) {
            var anchorElem = document.createElement("A");
            anchorElem.setAttribute('href', "#");
            anchorElem.innerText = pSuggestionList[index];
            anchorElem.onclick = suggestionClickEventListener;
            var liElem = document.createElement("LI");
            liElem.appendChild(anchorElem);
            ulElem.appendChild(liElem);
        }
        
        targetSuggestionElement.appendChild(ulElem);
    }

    function updateQuery(pSuggestion){
        var query = targetElement.value;

        var isSpaceAvailable = query.substr(query.length -1, 1) == ' ';

        var fieldType = null;
        if(oStrategy.getType() == oStrategyTypes.Field){
            fieldType = oStrategy.getFieldType(pSuggestion);
        }

        if(!isSpaceAvailable && oStrategy.getType() == oStrategyTypes.Logical) query = query + ' ';

        oStrategy.next();

        oStrategy.setOperatorType(fieldType);
        
        targetElement.value = query + pSuggestion + ' ';

        loadSuggestions();
    }

    // Events
    function attachEventListeners(){
        targetElement.onfocus = focusEventListener;
        targetElement.onkeyup = keyupEventListener;
    }

    function focusEventListener(ev){
        loadSuggestions();
    }

    function keyupEventListener(ev){
        if(!canDelete && ev.code == 'Backspace' || ev.code == 'Delete'){
            oThis.setStrategy(oStrategyTypes.Field);
            oThis.targetElement.value = '';
            loadSuggestions();
        }
        else if(ev.code == 'Quote' && oStrategy.getType() == oStrategyTypes.Logical){
            canDelete = !canDelete;
        }
    }

    function suggestionClickEventListener(ev){
        updateQuery(ev.target.innerText);
    }
    // End Events

}

function Type() {
    return {
        Field: "FIELD",
        Conditional: "CONDITIONAL",
        Logical: "LOGICAL"
    };
}

function FieldStrategy(Sqb) {
    var oThis = this;    
    var oFields = Sqb.getFields();
    var oType = Type().Field;

    oThis.getType = function (){
        return oType;
    }

    oThis.getSuggestions = function () {
        var tempArr = [];
        for (var idx = 0; idx < oFields.length; idx++) {
            tempArr.push(oFields[idx].name);            
        }
        return tempArr;
    }

    oThis.next = function () {
        Sqb.setStrategy(Type().Conditional);
    }

    oThis.setOperatorType = function(pOperatorType){    
    }

    oThis.getFieldType = function(pField){
        for (var idx = 0; idx < oFields.length; idx++) {
            if(oFields[idx].name == pField){
                return oFields[idx].type;
            }
        }
        return null;
    }
}

function ConditionalStrategy(Sqb) {
    var oThis = this;
    var oOperators = getOperators();
    var oType = Type().Conditional;
    var oOperatorType = null;

    oThis.getType = function (){
        return oType;
    }

    oThis.setOperatorType = function(pOperatorType){
        oOperatorType = pOperatorType;
    }

    oThis.getSuggestions = function () {
        var tempArr = [];

        for (var index = 0; index < oOperators.length; index++) {
            if(oOperators[index].type == oOperatorType){
                for (var idx = 0; idx < oOperators[index].operators.length; idx++) {
                    tempArr.push(oOperators[index].operators[idx].name);
                }
            }
        }
        return tempArr;
    }

    function getOperators() {
        return [
            {
                type: "number", operators: [
                    { name: "lesser than", operator: "<" },
                    { name: "greater than", operator: ">" },
                    { name: "equals", operator: "==" },
                    { name: "lesser than equals", operator: "<=" },
                    { name: "greater than equals", operator: ">=" },
                    { name: "not equals", operator: "!=" }]
            },
            {
                type: "string", operators: [
                    { name: "contains", operator: "contains" },
                    { name: "not contains", operator: "not contains" },
                    { name: "equals", operator: "equals" },
                    { name: "not equals", operator: "not equals" }]
            }
        ];
    }

    oThis.next = function () {
        Sqb.setStrategy(Type().Logical);
    }
}

function LogicalStrategy(Sqb) {
    var oThis = this;
    var oOperators = getOperators();
    var oType = Type().Logical;

    Sqb.targetElement.focus();

    oThis.getType = function (){
        return oType;
    }

    oThis.setOperatorType = function(pOperatorType){        
    }

    oThis.getSuggestions = function () {
        var tempArr = [];
        for (var index = 0; index < oOperators.length; index++) {
            tempArr.push(oOperators[index].name);            
        }

        return tempArr;
    }

    function getOperators() {
        return [
            { name: "and", operator: "&&" },
            { name: "or", operator: "||" }
        ];
    }

    oThis.next = function () {
        Sqb.setStrategy(Type().Field);
    }
}

