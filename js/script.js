"use strict";

jQuery(document).ready(function() {

    //###########################################
    //A2, A3 - TN Daten aus JSON in Accordeon

    /**
     * returns HTML span Element
     * @param {string} text 
     * @param {Array} classNames 
     * @returns {HTMLElement}
     */
    function getSpan(text = '', classNames = []) {
        let teilnehmerSpan = $(document.createElement('span')).text(text);
        if (classNames) {
            $.each(classNames, function(key, value) {
                teilnehmerSpan.addClass(value);
            });
        }

        return teilnehmerSpan;
    }

    /**
     * returns HTML Img Element
     * @param {string} src 
     * @param {string} alt 
     * @param {Array} classNames 
     * @returns {HTMLElement}
     */
    function getImg(src, alt = '', classNames = []) {
        let img = $(document.createElement('img')).attr("src", src).attr("alt", alt);
        if (classNames) {
            $.each(classNames, function(key, value) {
                img.addClass(value);
            });
        }

        return img;
    }

    /**
     * returns HTML Element with Teilnehmer Data
     * @param {JSON} tnData 
     * @returns {HTMLElement}
     */
    function getTeilnehmerElement(tnData) {
        let name = 'Frau '; //ladies 1st! ;D
        let bodyBg = 'bg-frau';
        if (tnData.maennlich) {
            name = 'Herr ';
            bodyBg = 'bg-mann';
        }
        name += tnData.name + ' ' + tnData.vorname;

        let teilnehmerElement = $(document.createElement('div')).addClass('teilnehmer').append(
            $(document.createElement('div')).addClass('tn-header').append(
                $(document.createElement('h2')).text(name)
            ).click(function() { //A3 - toggle on click
                $(this).parent().find('div.tn-body').toggle();
            }),
            $(document.createElement('div')).addClass('tn-body').addClass(bodyBg).append(
                getImg(tnData.pic, "Bild " + name),
                $(document.createElement('div')).addClass('tn-text').append(
                    getSpan('Wohnort: ', ['fw-bold']),
                    getSpan(tnData.stadt)
                ),
                $(document.createElement('div')).addClass('tn-text').append(
                    getSpan('E-Mail: ', ['fw-bold']),
                    getSpan(tnData.email)
                ),
                $(document.createElement('div')).addClass('tn-text').append(
                    getSpan('Info: ', ['fw-bold']),
                    getSpan(tnData.kurzeInfo)
                )
            ).hide()
        );

        return teilnehmerElement;
    }

    //Ajax requerst
    $.get({
        url: "teilnehmer.json",
        dataType: "json"
    }).done(function(jsonData) {
        $.each(jsonData.teilnehmer, function(i, item) {
            $('#tn-box').append(getTeilnehmerElement(item))
        });
    });

    //###########################################
    //A4, A5, A6 - Form validation

    const nameRegex = /^[a-z\s\-\.]*$/i;
    const salutationRegex = /^(herr|frau|divers)$/i;
    const mailRegex = /@/;
    const courseRegex = /^(javascript|php|jquery)$/i;

    /**
     * returns string with first letter uppercase
     * @param {string} string 
     * @returns {string}
     */
    function ucFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    //removes values from form inputs + feedback + error msg
    function clearFeedback() {
        $('#form').find('input').each(function(key, element) {
            if (element.id !== 'time-form-input') {
                element.value = '';
            }
        });
        clearErrorMsg();
        $('.feedback').remove();
    }

    //removes error msg
    function clearErrorMsg() {
        $(".error").hide();
        $(".error").remove();
    }

    /**
     * sets error msg on input
     * @param {HTMLElement} element 
     * @param {boolean} isEmpty 
     */
    function setErrorMsg(element, isEmpty = false) {
        let msg = $(element).attr("title") + ' darf nich leer sein.';
        if (!isEmpty) {
            msg = $(element).attr('data-regex');
        }

        $(element).before(getSpan(msg, ['error', 'fw-bold']));
        $(element).focus();
    }

    /**
     * validates if empty / pattern test
     * @param {string} elementId 
     * @param {RegExp} regex 
     * @returns {boolean}
     */
    function inputValidation(elementId, regex) {
        let element = $(elementId);
        if (!element.val()) {
            setErrorMsg(element, true);
            return false;
        } else {
            if (!regex.test(element.val())) {
                setErrorMsg(element);
                return false;
            }
        }

        return true;
    }

    //validates all input fields
    function formValidation() {
        clearErrorMsg();
        switch (false) {
            case inputValidation('#salutation-form-input', salutationRegex):
            case inputValidation('#name-form-input', nameRegex):
            case inputValidation('#fname-form-input', nameRegex):
            case inputValidation('#mail-form-input', mailRegex):
            case inputValidation('#course-form-input', courseRegex):
                return false
            default:
                break;
        }

        return true;
    }

    /**
     * builds element for form feedback
     * @param {HTMLElement} form 
     * @returns {HTMLElement}
     */
    function getFormSuccessFeedback(form) {
        let name = ucFirst(form.find('#salutation-form-input').val()) + ' ';
        name += ucFirst(form.find('#name-form-input').val().trim()) + ', ';
        name += ucFirst(form.find('#fname-form-input').val().trim());
        let formSuccessFeedback = $(document.createElement('div')).addClass('feedback col-md-6').append(
            $(document.createElement('p')).text('Vielen Dank für Ihre Angaben!'),
            $(document.createElement('p')).text(name),
            $(document.createElement('p')).text('E-Mail: ' + form.find('#mail-form-input').val().trim()),
            $(document.createElement('p')).text('Kurs: ' + form.find('#course-form-input').val()),
            $(document.createElement('p')).text('Angemeldet um: ' + form.find('#time-form-input').val())
        );

        return formSuccessFeedback;
    }

    //loop for time in form field
    function setClock() {
        let now = new Date();
        let hours = ('0' + now.getHours()).slice(-2);
        let minutes = ('0' + now.getMinutes()).slice(-2);
        let seconds = ('0' + now.getSeconds()).slice(-2);
        $('#time-form-input').val(`${hours}:${minutes}:${seconds}`);
        $('#time-form-input').prop("disabled", true);

        setTimeout(setClock, 1000)
    }

    //clock call
    setClock();

    //eventlistener - form submit
    $('#form').submit(function(event) {
        event.preventDefault();
        if (formValidation()) {
            $(this).parent().append(getFormSuccessFeedback($(this)));
        }
    });

    //eventlistener - form reset
    $('#form').on('reset', function(event) {
        event.preventDefault();
        clearFeedback();
    });

    //###########################################
    //BONUS

    $('#good-luck').after(
        $(document.createElement('p')).text('Danke!').addClass('fw-bold').attr('title',
            "<(' - '<) <(' - ')> (>' - ')>").css('cursor', 'pointer')
    );
});