/**
 * MultirowsWidget jscript file.
 *
 * @author Victor Kozmin <promcalc@gmail.com>
 *
 *     todo: добавить максимальное количестов строк, чтобы нельзя было больше добавлять
 */

function Multirow(param) {
//    console.log(jQuery(param.formselector).data().yiiActiveForm.attributes);
    var rowSelector = "." + param.rowclass,
        startindex = param.startindex,
        obForm = jQuery(param.formselector),
        getAllRows = function(){ return jQuery(rowSelector); },
        aRows = getAllRows(),
        templareRow = null,
        sNameRegexp = "^([\\w]+)\\[" + startindex + "\\]",
        sIdRegexp = "^([\\w]+)-" + startindex + "-",
        oAddLink = jQuery(param.addlinkselector),
        nMaxIndex = 0,
        sReg = "^" + param.model + "\\[([^\\]]+)\\]\\[?([^\\]\\[]+)\\]?",
//        sReg = "^" + param.model + "\\[([^\\]]+)\\]\\[?([\\w]+)\\]?",
        modelreg = new RegExp(sReg),
        baseAttributes = [],
        getBaseAttr = function(arr, id) {
            var oRet = null;
            for(var i in arr) {
                if( arr[i].id == id ) {
                    oRet = arr[i];
                    break;
                }
            }
            return oRet;
        },
        setDeleteLinkProp = function(oLink, index) {
//            console.log("setDeleteLinkProp: [" + index + "] ", oLink);
            oLink
                .attr("id", param.model + "_" + index + "_")
                .on("click", function(event) {
                    event.preventDefault();
                    if( (jQuery(rowSelector).length < 3) && !param.canDeleteLastRow ) {
                        return false;
                    }
                    var sId = jQuery(this).attr("id"),
                        formdata = obForm.data().yiiActiveForm,
                        settings = formdata['settings'],
                        aAttributes = formdata['attributes'],
                        regExp = new RegExp('^' + sId);

//                    console.log("Delete Id = " + sId + " aRows.length = " + aRows.length);

                    for(i = 0, nMax = aAttributes.length; i < nMax; i++) {
                        regExp.lastIndex = 0;
                        if( regExp.test(aAttributes[i].id) ) {
//                            console.log("Remuve field: " + aAttributes[i].id);
                            obForm.yiiActiveForm('remove', sId);
                            //                            aAttributes.splice(i, 1);
                            nMax -= 1;
                            i -= 1;
                        }
                    }

                    jQuery(this).parents(rowSelector).first().remove();
                    if( ('afterDelete' in param) && param.afterDelete ) {
                        param.afterDelete();
                    }
                    aRows = getAllRows();
                    return false;
                });
        };

    if( Multirow.nMaxIndex === undefined ) {
        Multirow.nMaxIndex = 0;
    }

//    console.log("Regexp name & id: ", sNameRegexp, sIdRegexp);
    // скрытое поле под индексы шаблонных строк, которые не нужно валидировать и сохранять
    jQuery("<input>").attr({type: "hidden", name: param.model + "[" + param.excluderow + "][]"}).val(startindex).appendTo(obForm);

    aRows.each(function(index) {
        var oRow = jQuery(this),
            aFields = oRow.find( "[name^='" + param.model + "[']"),
            nRowIndex = -1,
            count = -1;
        aFields.each( function(index, el){
            var oField = jQuery(this),
                sName = oField.attr('name'),
                id = oField.attr('id'),
                a = modelreg.exec(sName),
                nIndex = (a.length > 1) ? parseInt(a[1]) : -1;

            if(a.length > 1 ) {
                count = nIndex;
            }
            modelreg.lastIndex = 0;

            if( Multirow.nMaxIndex < nIndex ) {
                Multirow.nMaxIndex = nIndex;
            }

            if( typeof id === 'undefined' ) {
                return;
            }

            if( nIndex == startindex ) {
                nRowIndex = nIndex;
//                console.log("Start row el["+startindex+"]: name = " + sName + " id = " + id, a);
                var formAttr = obForm.yiiActiveForm('find', id);
                if( formAttr ) {
                    baseAttributes.push(formAttr);
                    obForm.yiiActiveForm('remove', id);
//                    console.log("Add base: " + id);
                }

            }

        });
        if( nRowIndex != -1 ) {
            oRow.hide();
            templareRow = oRow;
        }
        else {
            var ob = oRow.find(param.dellinkselector);
            if( (ob.length > 0) && (count > 0) ) {
                setDeleteLinkProp(ob, count);
            }
        }
    });

    oAddLink
        .off("click")
        .on("click", function(event){
            event.preventDefault;
//            console.log("baseAttributes: ", baseAttributes);
            if( templareRow === null ) {
                console.log("Error: not found template row");
                return;
            }
            var oNew = templareRow.clone(),
                aFields = oNew.find( "[name^='" + param.model + "[']");
            Multirow.nMaxIndex++;

            aFields.each( function(index, el){
                var oField = jQuery(this),
                    sName = oField.attr('name'),
                    sNewName = sName.replace(new RegExp(sNameRegexp), "$1[" + Multirow.nMaxIndex + "]"),
                    id = oField.attr('id'),
                    newId = (id !== undefined) ? id.replace(new RegExp(sIdRegexp), "$1-" + Multirow.nMaxIndex + "-") : "",
                    a = modelreg.exec(sName),
                    nIndex = (a.length > 1) ? parseInt(a[1]) : -1,
                    sFieldName = (a.length > 2) ? a[2] : "";

                oField.attr('name', sNewName);
//                console.log("Add: name = " + sName + " -> " + sNewName + " sFieldName = " + sFieldName);
                if( typeof id === 'undefined' ) {
                    return;
                }
                oField.attr('id', newId);

//                console.log("Add: id = " + id + " -> " + newId);
                var oAttr = getBaseAttr(baseAttributes, id);
                if( oAttr === null ) {
//                    console.log("Not found form data for id = " + id);
                    return;
                }
//                console.log("Find: ", oAttr);
                var oNewAttr = jQuery.extend(
                    {},
                    oAttr,
                    {
                        id: newId,
                        input: "#" + newId,
                        name: "[" + Multirow.nMaxIndex + "]" + sFieldName,
                        container: oAttr.container.replace(new RegExp(sIdRegexp.substr(1)), "$1-" + Multirow.nMaxIndex + "-")
                    }
                );
                oField.parents(oAttr.container).removeClass(oAttr.container.substr(1)).addClass(oNewAttr.container.substr(1));
//                console.log("Add: ", oNewAttr);
                obForm.yiiActiveForm('add', oNewAttr);

                modelreg.lastIndex = 0;
            });

            if( param.beforeInsert ) {
                param.beforeInsert(oNew);
            }

            aRows.last().after(oNew);

            setDeleteLinkProp(
                oNew.find(param.dellinkselector),
                Multirow.nMaxIndex
            );

            if( param.afterInsert ) {
                param.afterInsert(oNew);
            }

            oNew.show();

            aRows = getAllRows();
            return false;
        });

}
