/**
 * MultirowsWidget jscript file.
 *
 * @author Victor Kozmin <promcalc@gmail.com>
 */

function Multirow(param) {
    console.log(jQuery(param.formselector).data().yiiActiveForm.attributes);
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
            oLink
                .attr("id", param.model + "_" + index + "_")
                .on("click", function(event) {
                    event.preventDefault
                    var sId = jQuery(this).attr("id"),
                        formdata = obForm.data().yiiActiveForm,
                        settings = formdata['settings'],
                        aAttributes = formdata['attributes'],
                        regExp = new RegExp('^' + sId);
                    //                    console.log("Delete Id = " + sId + " aRows.length = " + aRows.length);

                    for(i = 0, nMax = aAttributes.length; i < nMax; i++) {
                        regExp.lastIndex = 0;
                        if( regExp.test(aAttributes[i].id) ) {
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

    console.log(sNameRegexp, sIdRegexp);
    jQuery("<input>").attr({type: "hidden", name: param.model + "[" + param.excluderow + "][]"}).val(startindex).appendTo(obForm);

    aRows.each(function(index) {
        var oRow = jQuery(this),
            aFields = oRow.find( "[name^='" + param.model + "[']"),
            nRowIndex = -1;
        aFields.each( function(index, el){
            var oField = jQuery(this),
                sName = oField.attr('name'),
                id = oField.attr('id'),
                a = modelreg.exec(sName),
                nIndex = (a.length > 1) ? parseInt(a[1]) : -1;

            modelreg.lastIndex = 0;

            if( Multirow.nMaxIndex < nIndex ) {
                Multirow.nMaxIndex = nIndex;
            }

            if( typeof id === 'undefined' ) {
                return;
            }

            if( nIndex == startindex ) {
                nRowIndex = nIndex;
                console.log("Start row el["+startindex+"]: name = " + sName + " id = " + id, a);
                var formAttr = obForm.yiiActiveForm('find', id);
                if( formAttr ) {
                    baseAttributes.push(formAttr);
                    obForm.yiiActiveForm('remove', id);
                    console.log("Add base: " + id);
                }

            }

        });
        if( nRowIndex != -1 ) {
            oRow.hide();
            templareRow = oRow;
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
                console.log("Add: name = " + sName + " -> " + sNewName + " sFieldName = " + sFieldName);
                if( typeof id === 'undefined' ) {
                    return;
                }
                oField.attr('id', newId);

                console.log("Add: id = " + id + " -> " + newId);
                var oAttr = getBaseAttr(baseAttributes, id);
                if( oAttr === null ) {
                    console.log("Not found form data for id = " + id);
                    return;
                }
                console.log("Find: ", oAttr);
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
                console.log("Add: ", oNewAttr);
                obForm.yiiActiveForm('add', oNewAttr);

                modelreg.lastIndex = 0;
            });

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

/*
     setDeleteLinkProp = function(oLink, index) {
     oLink
     .attr("id", param.model + "_" + index + "_")
     .on("click", function(event) {
     event.preventDefault
     var sId = jQuery(this).attr("id"),
     formdata = obForm.data().yiiActiveForm,
     settings = formdata['settings'],
     aAttributes = formdata['attributes'],
     regExp = new RegExp('^' + sId);
     //                    console.log("Delete Id = " + sId + " aRows.length = " + aRows.length);

     for(i = 0, nMax = aAttributes.length; i < nMax; i++) {
     regExp.lastIndex = 0;
     if( regExp.test(aAttributes[i].id) ) {
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
     },

     findAttrByName = function(name) {
     var sTempl = "]" + name,
     nLen = sTempl.length;

     for(var i in baseAttributes) {
     if( baseAttributes[i].name.substr(-nLen) == sTempl ) {
     return baseAttributes[i];
     }
     }
     return null;
     },
     */

/*
    aRows.each(function(index) {
        var ob = jQuery(this),
            oField = ob.find( "[name^='" + param.model + "']").first(),
            sName = oField.attr('name'),
            a = modelreg.exec(sName),
            nIndex = parseInt(a[1]);

        modelreg.lastIndex = 0;

        if( nMaxIndex < nIndex ) {
            nMaxIndex = nIndex;
        }

        if( index == 0 ) {
            ob.hide();
        }
        else {
            setDeleteLinkProp(
                ob.find(param.dellinkselector),
                nIndex
            );

        }
    });

    oAddLink
        .off("click")
        .on("click", function(event){
            event.preventDefault;

            var formdata = jQuery(param.formselector).data().yiiActiveForm,
                settings = formdata['settings'],
                aAttributes = formdata['attributes'],
                sTemplate = param.model + '-0-',
                regExp = new RegExp('^' + sTemplate, "i");

            aRows = getAllRows();

            for(i = 0, nMax = aAttributes.length; i < nMax; i++) {
                regExp.lastIndex = 0;
                if( regExp.test(aAttributes[i].id) ) {
                    baseAttributes.push(aAttributes.splice(i, 1)[0]);
                    nMax -= 1;
                    i -= 1;
                }
            }

            var oNew = aRows.first().clone(),
                aFields = oNew.find("[name^='" + param.model + "']");
            nMaxIndex += 1;

            aFields.each(function(index){
                var ob = jQuery(this),
                    sName = ob.attr('name'),
                    sId = ob.attr('id'),
                    a = modelreg.exec(sName),
                    nIndex = parseInt(a[1]),
                    sField = a[2],
                    sNewName = param.model + "[" + nMaxIndex + "][" + sField + "]",
                    sNewId = param.model.toLowerCase() + "-" + nMaxIndex + "-" + sField,
                    oAttr = findAttrByName(sField),
                    sNewContainer;
//                console.log("attr " + sField + " = ", oAttr);
                sNewContainer = oAttr.container.replace("-0-", "-" + nMaxIndex + "-");

                ob
                    .attr("name", sNewName)
                    .attr("id", sNewId)
                    .parents(oAttr.container + ":first")
                    .removeClass(oAttr.container.substr(1))
                    .addClass(sNewContainer.substr(1));
                oNew
                    .find( "[for='" + sId + "']")
                    .attr("for", sNewId);
                oNew
                    .find( "#" + sId + "_em_")
                    .attr("id", sNewId + "_em_");

                var oField = {
                    'id': sNewId,
                    'input': "#" + sNewId,
                    'container': sNewContainer,
                    'name': '[' + nMaxIndex + ']' + sField,
                    'status': 1
                };

                aAttributes.push(
                    jQuery.extend(
                        {},
                        oAttr,
                        oField
                    )
                );
            });
            aRows.last().after(oNew);
            oNew.show();
            setDeleteLinkProp(
                oNew.find(param.dellinkselector),
                nMaxIndex
            );
            if( param.afterInsert ) {
                param.afterInsert(oNew);
            }

            aRows = getAllRows();
            return false;
        });
*/
}
