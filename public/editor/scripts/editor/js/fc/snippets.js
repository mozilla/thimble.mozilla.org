define(function() {

    var snippets = {
        HTML: [{
                name: "Comment",
                title: "Add a Comment",
                id: "snippet-comment",
                data: "<!--  -->"
            },
            {
                name: "Table",
                title: "Add a Table",
                id: "snippet-table",
                data: '<table> \n' +
                    '	<tr> \n' +
                    '		<th></th> \n' +
                    '		<th></th> \n' +
                    '	</tr> \n' +
                    '	<tr> \n' +
                    '		<td></td> \n' +
                    '		<td></td> \n' +
                    '	</tr> \n' +
                    '</table>'
            },
            {
                name: "Definition List",
                title: "Add a Definition List",
                id: "snippet-definitionList",
                data: '<dl> \n' +
                    '	<dt></dt> \n' +
                    '		<dd></dd> \n' +
                    '	<dt></dt> \n' +
                    '		<dd></dd> \n' +
                    '</dl>'
            }
        ],
        CSS: [{
                name: "Body Tag",
                title: "Add a Body Tag",
                id: "snippet-BodyTag",
                data: 'body {\n' +
                    '     background-color: lightblue;\n' +
                    '}'
            },
            {
                name: "Paragraph Tag",
                title: "Add a Paragraph Tag",
                id: "snippet-ParagraphTag",
                data: 'p {\n' +
                    '     font-size: 20px;\n' +
                    '}'
            }
        ],
        JS: [{
            name: "Basic Function",
            title: "Add a Basic Function",
            id: "snippet-BasicFunction",
            data: 'function functionName(argument) {\n' +
                '  ....\n' +
                '}'
        }]
    };

    function Snippets() {}

    Snippets.getSnippetObj = function() {
        return snippets;
    };

    return Snippets;
});