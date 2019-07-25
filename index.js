// Packages
const cheerio = require('cheerio')

module.exports = function upsell(data) {

  // Processing of CSS
  const processStyle = (data) => {
    console.log('Processing CSS upsell')
    const endOfStyleBlock = data.indexOf('</style>')
    const styleToInsert = `
/* Module: Upsell on: ${new Date()} */

/* STEP 2 */
.frb--minimized, .frb-step2 { display: none; }

/* STEP 2 UPSELL*/
.frb-upsell,
.frb-monthly-diff-amt .frb-amt-monthly {
    display: none;
    width: calc(100% + 8px) !important;
    transition: background-color 0.5s ease;
    padding: 10px 4px;
    text-align: center;
}
.frb-monthly-diff-amt .frb-amt-monthly {
    display: block;
    padding: 0 4px 10px 4px;
}
.frb-upsell-cta,
.frb-upsell-ty {
    font-size: 17px;
    line-height: 1.3;
    font-weight: bold;
    text-align: center;
}
.frb-upsell-color,
.frb-monthly-diff-amt .frb-amt-monthly label {
    display: block;
    font-size: 15px;
    line-height: 1.3;
    font-weight: normal;
    padding: 0 5%;
    margin: .5em 0;
}
.frb-monthly-diff-amt-link {
    font-size: 15px;
    line-height: 1.3;
    color: #36c;
    margin: 8px 2px;
    padding: 12px 10%;
    text-align: center;
    cursor: pointer;
    font-weight: bold;
}

#frb-amt-monthly-other-input {
    position: relative;
    text-align: center;
    font-size: 18px;
}

.frb--minimized .frb-step2 {
    display: none !important;
}

.frb-monthly-diff-amt {
    display: none;
    margin-top: 50px;
}


/* BACK BUTTON */
.frb-back {
    display: none;
    cursor: pointer;
    position: absolute;
    left: 27px;
    top: 0;
}
.frb-back:hover .frb-icon path {
    stroke: #000;
}
.frb-back:hover .frb-icon fill {
    fill: #000;
}
.frb-icon-back {
    height: 13px;
    width: 20px;
}
.frb--minimized .frb-back {
    display: none !important;
}

/* Module: Upsell */
    `

    return data.substring(0, endOfStyleBlock) + '\n' + styleToInsert + '\n\n' + data.substring(endOfStyleBlock)

  };

  // Processing of HTML
  const processHtml = (data) => {
    console.log('Processing HTML upsell')
    let $ = cheerio.load(data, {
      decodeEntities: false
    })

    // Create step1 block
    const frbForm = $('form#frb-form')
    const frbFormContents = frbForm.html()
    frbForm.empty()
    frbForm.append('<div class="frb-step1"></div>')
    $('.frb-step1').append(frbFormContents)

    // Add frb-back buttons
    const frbBackButtons = `
<div class="frb-back close-optin" tabindex="0">
    <svg class="frb-icon frb-icon-back" aria-labelledby="frb-icon-back-title" xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16"><title id="frb-icon-back-title">Back</title><g fill="none" fill-rule="evenodd" transform="translate(1 1)"><path stroke="#72777D" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.778" d="M7.181 13.285L.753 7 7.181.715"/><rect width="18.182" height="1.778" x=".818" y="6.111" fill="#72777D" rx=".889"/></g></svg>
</div>
<div class="frb-back close-optin2" tabindex="0">
    <svg class="frb-icon frb-icon-back" aria-labelledby="frb-icon-back-title" xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16"><title id="frb-icon-back-title">Back</title><g fill="none" fill-rule="evenodd" transform="translate(1 1)"><path stroke="#72777D" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.778" d="M7.181 13.285L.753 7 7.181.715"/><rect width="18.182" height="1.778" x=".818" y="6.111" fill="#72777D" rx=".889"/></g></svg>
</div>
    `
    $('.frb-form').prepend(frbBackButtons)

    // Remove frb-submit button
    $('.frb-step1 .frb-submit').remove()

    // Add frb continue button
    const frbContinueButton = `

<fieldset class="frb-continue">
    <button class="frb-submit" id="continue-btn">
       <span class="frb-submit-txt">Continue</span>
    </button>
</fieldset>
    `

    $('.frb-methods').after(frbContinueButton)

    // Add the step2
    const step2 = `
<div class="frb-step2">
  <div class="frb-upsell">
       <p class="frb-upsell-cta">Why not make it <span class="frb-upsell-ask"></span> monthly?</p>
       <p class="frb-upsell-color">Monthly support is the best way to ensure that Wikipedia keeps thriving.</p>
  </div>
  <div class="frb-monthly-buttons">
      <button id="frb-monthly-donate-yes" class="frb-submit" onclick="return false;">
          <span class="frb-submit-txt">Yes, I'll donate <span class="frb-upsell-ask"></span> each month</span>
      </button>
      <button id="frb-monthly-donate-no" class="frb-submit" onclick="return false;">
          <span class="frb-submit-txt">No, thanks! I'll make a one-time donation of <span class="frb-ptf-total"></span></span>
      </button>
  </div>
  <div class="frb-monthly-diff-amt-link">Yes, I'll donate monthly, but for a different amount</div>
  <div class="frb-monthly-diff-amt">
      <p class="frb-upsell-ty">Thank you for your support!</p>
      <div class="frb-amt-monthly">
          <label for="frb-amt-monthly-other-input">Enter your monthly donation amount</label>
          <input name="otherMonthlyAmount" type="text" id="frb-amt-monthly-other-input" size="3" autocomplete="off" value="" tabindex="-1" />
      </div>
      <div class="frb-error frb-error-smallamount">{{int:Donate_interface-smallamount-error}}</div>
      <div class="frb-error frb-error-bigamount">{{int:Donate_interface-bigamount-error}}</div>
      <button id="donate-monthly" class="frb-submit" onclick="return false;">
          <span class="frb-submit-secure-transaction">
              <svg class="frb-icon frb-icon-lock" role="img" aria-labelledby="frb-icon-lock-title" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><title id="frb-icon-lock-title">{{int:Centralnotice-FR2015_translations-secure-transaction}}</title><path d="M16.07 8H15V5s0-5-5-5-5 5-5 5v3H3.93A1.93 1.93 0 0 0 2 9.93v8.15A1.93 1.93 0 0 0 3.93 20h12.14A1.93 1.93 0 0 0 18 18.07V9.93A1.93 1.93 0 0 0 16.07 8zM10 16a2 2 0 1 1 2-2 2 2 0 0 1-2 2zm3-8H7V5.5C7 4 7 2 10 2s3 2 3 3.5z"/></svg>
          </span>
          <span class="frb-submit-txt">{{int:Centralnotice-FR2015_translations-donate}} <span class="frb-monthly-total"></span> <span class="frb-submit-label-now">{{int:Centralnotice-FR2015_translations-now}}</span><span class="frb-submit-label-monthly">monthly</span></span>
      </button>
  </div>
</div>
    `

    frbForm.append(step2)

    data = $.html()
    return data
  }

  // Processing of JS
  const processJs = (data) => {
    console.log('Processing JS upsell')

    // const regExpFrbSubmitFunction = RegExp(/(\$\('.frb-submit'\).on*((?:.*?\r?\n?)*)}+\);)/gm)
    const regExpFrbSubmitFunction = RegExp(/(\$\('\.frb-submit'\).on[\s\S]*?}\);)/gm)
    // const regExpFunctionjQueryFunction = RegExp(/(\$\(function\(\)*?\s?{)/g)

    const frbFunctionsToInsertWithinJqueryFunction = `
      frb.getMonthlyAmount = function() {
          var form = document.getElementById('frb-form');
          var amount = null;

          // Check the "monthly other" amount box
          if (form.otherMonthlyAmount.value !== '') {
              var otherMonthlyAmount = form.otherMonthlyAmount.value;
              otherMonthlyAmount = otherMonthlyAmount.replace(/[,.](\d)$/, ':$10');
              otherMonthlyAmount = otherMonthlyAmount.replace(/[,.](\d)(\d)$/, ':$1$2');
              otherMonthlyAmount = otherMonthlyAmount.replace(/[$£€¥,.]/g, '');
              otherMonthlyAmount = otherMonthlyAmount.replace(/:/, '.');
              amount = otherMonthlyAmount;
          }

          amount = parseFloat(amount);

          if ( isNaN(amount) ) {
              return 0;
          } else {
              var totalMonthlyAmountFormatted = frb.formatCurrency(currency, amount, language);
              $('.frb-monthly-total').text(totalMonthlyAmountFormatted);

              return amount;
          }
      };

      frb.validateMonthlyAmount = function() {
          var amount = frb.getMonthlyAmount();
          var currency  = frb.getCurrency( mw.centralNotice.data.country );
          var minAmount = frb.amounts.minimums[ currency ];
          if ( amount === null || isNaN(amount) || amount <= 0 || amount < minAmount ) {
              $('.frb-error-smallamount').show();
              return false;
          } else if ( amount > 10000 * minAmount ) {
              $('.frb-error-bigamount').show();
              return false;
          } else {
              $('.frb-error-smallamount, .frb-error-bigamount').hide();
              return true;
          }
      };
      `

    const frbFunctionsToInsertOutsideJqueryFunction = `
      frb.submitMonthlyForm = function (options, isEndowment) {

        var uri = new mw.Uri('https://payments.wikimedia.org/index.php/Special:GatewayFormChooser');
        var params = {};

        /* Form selection data */
        params.payment_method = options.method;
        if (options.submethod) {
            params.payment_submethod = options.submethod;
        }
        if (options.gateway) {
            params.gateway = options.gateway;
        }
        if (options.ffname) {
            params.ffname = options.ffname;
        }
        if (options.variant) {
            params.variant = options.variant;
        }
        params.recurring = frb.getRecurring();

        params.currency_code = frb.getCurrency(mw.centralNotice.data.country) || 'USD';

        params.uselang = mw.centralNotice.data.uselang || 'en';
        params.country = mw.centralNotice.data.country || 'XX';

        if (params.uselang === 'pt' && params.country === 'BR') {
            params.uselang = 'pt-br';
        }
        if (params.uselang === 'es' &&
            (params.country === 'AR' || params.country === 'CL' ||
                params.country === 'CO' || params.country === 'MX' ||
                params.country === 'PE' || params.country === 'UY')
        ) {
            params.uselang = 'es-419';
        }

        /* Adyen override. frb.ccAdyenCountries is defined in LocalizeJS-2017.js */
        if (params.payment_method === 'cc' && frb.ccAdyenCountries.indexOf(params.country) !== -1) {
            params.gateway = 'adyen';
        }

        /* Amount */
        var amount = frb.getMonthlyAmount();
        if ($('#frb-ptf-checkbox').prop('checked')) {
            frb.extraData.ptf = 1;
        }
        params.amount = amount;

        /* Email optin */
        if ($('input[name="opt_in"]').length > 0) {
            var opt_inValue = $('input[name="opt_in"]:checked').val();
            params.opt_in = opt_inValue; // frb.validateForm() already checked it's 1 or 0
            params.variant = 'emailExplain'; // Show message about receipt on cc form
        }

        /* Tracking info */
        if (isEndowment) {
            params.utm_medium = 'endowment';
        } else {
            params.utm_medium = 'sitenotice';
        }
        params.utm_campaign = mw.centralNotice.data.campaign || 'test';
        params.utm_source = frb.buildUtmSource(params);

        frb.extraData.vw = window.innerWidth;
        frb.extraData.vh = window.innerHeight;
        frb.extraData.time = Math.round((Date.now() - frb.loadedTime) / 1000);

        if (!$.isEmptyObject(frb.extraData)) {
            params.utm_key = frb.buildUtmKey(frb.extraData);
        }

        /* Link to Banner History if enabled */
        var mixins = mw.centralNotice.getDataProperty('mixins');
        if (mixins && mixins.bannerHistoryLogger) {
            params.bannerhistlog = mw.centralNotice.bannerHistoryLogger.id;
        }

        uri.extend(params);

        if (mixins && mixins.bannerHistoryLogger) {
            mw.centralNotice.bannerHistoryLogger.ensureLogSent().always(function () {
                window.location.href = uri.toString();
            });
        } else {
            window.location.href = uri.toString();
        }

    };
    `

    const scriptToInsert = `
/* Module: Upsell on: ${new Date()} */

// Event: Go back to Step 1
$('body').on('click', '.close-optin', function(e) {
    $('.frb-step2').hide();
    $('.frb-step1').show().css('opacity', 1);

    $('.frb-optin').hide();
    $('.frb-frequency').show();
    $('.frb-amounts').show();
    $('.frb-methods').show();
    $('.frb-rml').show();
    $('.frb-upsell').hide();
    $('.close-optin').hide();
    $('.frb-close').show();
});

// Event: Go back to Step 2
$('body').on('click', '.close-optin2', function(e) {
    validAmount = 1;
    frb.activateCTA();
    frb.toggleMonthly(false);
    $('.frb-monthly-diff-amt, .close-optin2').hide();
    $('.frb-upsell, .frb-monthly-buttons, .frb-monthly-diff-amt-link, .close-optin').show();
});

// Event: Donate monthly other amount
$(document).on('click keypress', '.frb-monthly-diff-amt-link', function(e) {
    if(e.which === 13 || e.type === 'click') {
        e.stopPropagation();
        document.getElementById('frb-form').otherMonthlyAmount.value = '';
        validAmount = 0;
        frb.activateCTA();
        frb.toggleMonthly(true);
        $('.frb-upsell, .frb-monthly-buttons, .frb-monthly-diff-amt-link, .close-optin').hide();
        $('.frb-monthly-diff-amt, .close-optin2').show();
    }
});

// Event: Validate monthly other amount
$(document).on('input change', '#frb-amt-monthly-other-input', function(e) {
    if ( frb.validateMonthlyAmount() ) {
        validAmount = 1;
        frb.updateUpsellAsk();
    } else {
        validAmount = 0;
    }
    frb.activateCTA();
});

// Event: Monthly donate yes
$(document).on('click keypress', '#frb-monthly-donate-yes', function(e) {
    if(e.which === 13 || e.type === 'click') {
        e.stopPropagation();
        frb.toggleMonthly(true);
        frb.submitMonthlyForm(frb.storedOptions);
    }
});

// Event: Monthly donate no
$(document).on('click keypress', '#frb-monthly-donate-no', function(e) {
    if(e.which === 13 || e.type === 'click') {
        e.stopPropagation();
        frb.submitForm(frb.storedOptions);
    }
});

// Event: Donate monthly
$(document).on('click keypress', '#donate-monthly', function(e) {
    if(e.which === 13 || e.type === 'click') {
        e.stopPropagation();
        frb.submitMonthlyForm(frb.storedOptions);
    }
});

 // Event: Go to the second step of the form
$(document).on('click', '#continue-btn', function(e) {
    e.preventDefault();
    var status = {amount: false, method: false};

    // Validate amount
    if( frb.validateAmount() ){
        status.amount = true;
    }

    // Validate method
    if($('input[name="frb-methods"]:checked').length === 1){
        status.method = true;
    } else {
        $('.frb-methods').addClass('frb-haserror');
        $('.frb-error-method').show();
    }

    if(status.amount === true && status.method === true){
        if(!$('.frb-optin').is(':visible')) {
            $('.frb-optin').slideDown();
        }

        // Only do step 2 if gift is one-time and payment method supports monthly
        if( frb.getRecurring(document.getElementById('frb-form')) || $('#frb-frequency-monthly').prop('disabled') ) {
            frb.submitForm(frb.storedOptions);
        } else {
            $('.frb-rml-link').fadeOut();
            $('.frb-step1').fadeToggle(function(){
                $('.frb-step2').fadeToggle();
                $('.frb-rml-form').hide();
                $('.frb-upsell').show().css('display', 'block');
                $('.close-optin').show();
                $('.frb-close').hide();
            });
        }
    }
});

// Function: updateUpsellAsk
frb.updateUpsellAsk = function() {
    var form = document.getElementById('frb-form');
    var amount, upsellAmount;

    if (form.otherMonthlyAmount.value !== '') {
        upsellAmount = form.otherMonthlyAmount.value;
    } else {
        amount = frb.getAmount(form);
        feeAmount = frb.calculateFee(amount);
        if ( $('#frb-ptf-checkbox').prop('checked') ) {
            totalAmount = amount + feeAmount;
        } else {
          totalAmount = amount;
        }

        if (totalAmount <= 5 ) {
            upsellAmount = 2.75;
        }
        else if (totalAmount <= 10 ) {
            upsellAmount = 3;
        }
        else if (totalAmount <= 20 ) {
            upsellAmount = 5;
        }
        else if (totalAmount <= 30 ) {
            upsellAmount = 7;
        }
        else if (totalAmount <= 50 ) {
            upsellAmount = 9;
        }
        else if (totalAmount <= 100 ) {
            upsellAmount = 11;
        }
        else if (totalAmount <= 250 ) {
            upsellAmount = 25;
        }
        else if (totalAmount <= 500 ) {
            upsellAmount = 50;
        }
        else {
            upsellAmount = 100;
        }

        //update other monthly input
        form.otherMonthlyAmount.value = upsellAmount;
    }

    var upsellAmountFormatted = frb.formatCurrency(currency, upsellAmount, language);
    $('.frb-upsell-ask').text(upsellAmountFormatted);
};

// Event: Update the method on step 2 when a method is clicked in step 1.
$('body').on('click', '.frb-button[data-name]', function(){
    $('.frb-selected-method').text($(this).attr('data-name'));
});

$('body').on('click', '[name="monthly"]', function(){
    if( $(this).prop('checked') ) {
        frb.toggleMonthly(true);
    } else {
        frb.toggleMonthly(false);
    }
});

/* Module: Upsell on: ${new Date()} */
`

    try {
      const endOfScriptBlock = data.indexOf('</script>')

      data = data.substring(0, endOfScriptBlock) + '\n' + scriptToInsert + '\n\n' + data.substring(endOfScriptBlock)
      data = data.replace(regExpFrbSubmitFunction, "")

      const startOfJqueryFunction = data.indexOf('$(function')
      data = data.substring(0, startOfJqueryFunction) + '\n' + frbFunctionsToInsertOutsideJqueryFunction + '\n\n' + data.substring(startOfJqueryFunction)

      const startOfJActivateCTAFunction = data.indexOf('frb.activateCTA =')
      data = data.substring(0, startOfJActivateCTAFunction) + '\n' + frbFunctionsToInsertWithinJqueryFunction + '\n\n' + data.substring(startOfJActivateCTAFunction)
    } catch (e) {
      console.log(e)
    }

    return data
  }

  data = processStyle(data)
  data = processJs(data)
  data = processHtml(data)

  return data
}
