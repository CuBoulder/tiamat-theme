    var article = document.querySelector('.ucb-newsletter')
    var loggedIn = article.getAttribute('data-loggedin') == 'true' ? true : false;
    var email = document.getElementById('email-preview')
    var newsletterPromos = document.getElementsByClassName('ucb-newsletter-promo-one')

// init
if(loggedIn){
    /* If logged in, we will create the Newsletter email HTML and render a preview and a copy button,
         otherwise just display the regular Newsletter node */

    // Add title to email newsletter from page
    var newsletterTitle = document.getElementsByClassName('ucb-newsletter-title') // newsletter title from newsletter page
    var emailTitle = document.getElementById('newsletter-email-title')
    emailTitle.innerText = newsletterTitle[0].innerText

    // Add intro image to email newsletter
    var newsletterIntroImg = document.getElementById('newsletter-intro-img').getElementsByTagName('img')// newsletter image
    var emailIntroImg = document.getElementById('newsletter-email-intro-img')
    emailIntroImg.src = newsletterIntroImg[0].src

    // For each article section, fill in templates and append
    var newsletterArticleSections = document.getElementsByClassName('paragraph--type--newsletter-section')

    // Iterate through article sections
  for (var i = 0; i < newsletterArticleSections.length; i++) {

    // Grab titles
    var articleSection = newsletterArticleSections[i].getElementsByTagName('h2')[0]
    var articleSectionTitle = articleSection.innerText

    // Grab Button
    var newsletterSectionButton = newsletterArticleSections[i].getElementsByClassName('button')[0]
    // Grab Article Sections
    var articleSectionArticles = newsletterArticleSections[i].getElementsByClassName('col-lg-5')

    // Create Article Section Table for Email
    var table = document.createElement('table')
    table.id = `article-table-${i}`
    table.setAttribute('role','presentation')
    table.setAttribute('border','0')
    table.setAttribute('width',"100%")

    // Add the header to the article section
    var tableHeader = document.createElement('tr')
    tableHeader.style = "padding: 15px 15px 15px 60px; padding: 15px 15px 15px 60px;"
    tableHeader.innerHTML = `<td style="padding: 15px 15px 15px 60px";><h2 class="newsletter-email-article-header"style="font-size: 28px; font-family:Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;"> ${articleSectionTitle}</h2></td>`
    table.appendChild(tableHeader)

    document.getElementById('email-newsletter-article-section').appendChild(table)

    // Grab articles from each section 
    for(var x=0; x<articleSectionArticles.length; x++){

        var article = articleSectionArticles[x] // each article

        // Get img src and alt from newsletter page articles
        var articleImg = article.nextElementSibling.children[0]
        var articleImgSrc = articleImg.src
        var articleImgAlt = articleImg.alt

        // Create a table cell
        var emailArticleSection = document.createElement('td')
        emailArticleSection.style = "vertical-align: top;padding: 15px 15px 30px 60px"
        // Create an image
        var emailArticleImg = document.createElement('img')
        emailArticleImg.style = 'width:200px; align:center'
        // Set img src and alt tag
        emailArticleImg.src = articleImgSrc
        emailArticleImg.alt = articleImg

        // Create Linked Header
        var emailHeaderLink = document.createElement('a')
        emailHeaderLink.href = article.children[0].children[0].href // get link from newsletter article
        emailHeaderLink.innerHTML = `<h3>${article.children[0].children[0].innerText}</h3>`

        // Create summary
        newsletterArticleSummary = article.getElementsByClassName('article-summary')[0].innerText // from newsletter node
        var emailArticleSummary = document.createElement('p')
        emailArticleSummary.style = "margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;"
        emailArticleSummary.innerHTML = newsletterArticleSummary
        


        // Append
        emailArticleSection.appendChild(emailArticleImg) // image first
        emailArticleSection.appendChild(emailHeaderLink)
        emailArticleSection.appendChild(emailArticleSummary) // summary
        table.appendChild(emailArticleSection) // add table section to email
    }
    // After articles, create and append newsletter button, button containers
    var buttonRow = document.createElement('tr')
    var buttonCell = document.createElement('td')
    // Style container
    buttonCell.style = "padding: 15px 15px 15px 60px;"

    var emailButton = document.createElement('a')
    emailButton.style = 'display: inline-block;padding: 5px 10px;font-weight: bold;text-decoration: none !important;border-radius: 3px;background-color: #0277BD;color: #fff !important;'
    emailButton.href = newsletterSectionButton.href
    emailButton.innerText = newsletterSectionButton.innerText
    buttonCell.appendChild(emailButton)
    buttonRow.appendChild(buttonCell)
    table.appendChild(buttonRow)

}

// PROMO ONE
    // Conditional render if Promo sections exist
    if(newsletterPromos[0]){
        var newsletterPromoLink = newsletterPromos[0].children[0].href
        var newsletterPromoImg = newsletterPromos[0].getElementsByTagName('img')[0]
        // Create & Style promo one elements
        var promoOneTable = document.createElement('table')
        promoOneTable.setAttribute('role','presentation')
        promoOneTable.setAttribute('border','0')
        promoOneTable.setAttribute('width',"100%")
        promoOneTable.setAttribute('cellspacing','0')

        var promoOneTbody = document.createElement('tbody')
        var promoOneRow = document.createElement('tr')
        var promoOneTd = document.createElement('td')
        promoOneTd.setAttribute('align','center')
        promoOneTd.style = 'color: white;'

        var promoOneLink = document.createElement('a')
        var promoOneImg = document.createElement('img')
        promoOneImg.setAttribute('width','100%')

        // Assign link, src, alt to Promo Img
        promoOneLink.href = newsletterPromoLink
        promoOneImg.src = newsletterPromoImg.src
        promoOneImg.alt = newsletterPromoImg.alt

        // Append
        promoOneLink.appendChild(promoOneImg)
        promoOneTd.appendChild(promoOneLink)
        promoOneRow.appendChild(promoOneTd)
        promoOneTable.appendChild(promoOneRow)
        document.getElementById('email-newsletter-promo-one-section').appendChild(promoOneTable)
    }
    // Make the Blocks
    var newsletterBlocksSection = document.getElementsByClassName('ucb-newsletter-blocks')
    var newsletterBlocksArr = newsletterBlocksSection[0].children

    // If blocks exist, create tables
    if(newsletterBlocksArr.length){
        // Create the outer Block Table, apply table attributes
        var emailBlocksTable = document.createElement('table')
        emailBlocksTable.setAttribute('role','presentation')
        emailBlocksTable.setAttribute('border','0')
        emailBlocksTable.setAttribute('width',"100%")
        emailBlocksTable.setAttribute('cellspacing','0')
        // Create block row & tbody
        var blockRow = document.createElement('tr')
        var blockTableBody = document.createElement('tbody')
        // iterate over the blocks in the newsletter page to create email version
        for(var y=0; y < newsletterBlocksArr.length; y++){
            // Table setup for email version
            var blockData = document.createElement('td')
            // Conditional styling depending on Block position in email
            if(y===0){
                blockData.style = "vertical-align:top; padding: 15px 15px 30px 60px;"
            } else {
                blockData.style = "vertical-align: top;padding: 15px 30px 30px 60px;"
            }
            // Create Header
            var emailBlockHeader = document.createElement('h3')
            emailBlockHeader.style = "font-size: 28px; margin:0 0 20px 0; font-family:Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;"
            emailBlockHeader.innerText = newsletterBlocksArr[y].children[0].innerText
            
            // Create Text
            var emailBlockText = document.createElement('p')
            emailBlockText.style = "margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;"
            emailBlockText.innerText = newsletterBlocksArr[y].children[1].innerText

            // Append
            blockData.appendChild(emailBlockHeader)
            blockData.appendChild(emailBlockText)
            blockRow.appendChild(blockData)
        }
        // Append finished Blocks to email preview DOM
        blockTableBody.appendChild(blockRow)
        emailBlocksTable.appendChild(blockTableBody)
        document.getElementById('email-newsletter-blocks-section').appendChild(emailBlocksTable)

    }

    // PROMO TWO
    // Conditional render if Promo sections exist
    if(newsletterPromos[1]){
        var newsletterPromoLink = newsletterPromos[1].children[0].href
        var newsletterPromoImg = newsletterPromos[1].getElementsByTagName('img')[0]
        // Create & Style promo one elements
        var promoTwoTable = document.createElement('table')
        promoTwoTable.setAttribute('role','presentation')
        promoTwoTable.setAttribute('border','0')
        promoTwoTable.setAttribute('width',"100%")
        promoTwoTable.setAttribute('cellspacing','0')

        var promoTwoTbody = document.createElement('tbody')
        var promoTwoRow = document.createElement('tr')
        var promoTwoTd = document.createElement('td')
        promoTwoTd.setAttribute('align','center')
        promoTwoTd.style = 'color: white;'

        var promoTwoLink = document.createElement('a')
        var promoTwoImg = document.createElement('img')
        promoTwoImg.setAttribute('width','100%')

        // Assign link, src, alt to Promo Img
        promoTwoLink.href = newsletterPromoLink
        promoTwoImg.src = newsletterPromoImg.src
        promoTwoImg.alt = newsletterPromoImg.alt

        // Append
        promoTwoLink.appendChild(promoTwoImg)
        promoTwoTd.appendChild(promoTwoLink)
        promoTwoRow.appendChild(promoTwoTd)
        promoTwoTable.appendChild(promoTwoRow)
        document.getElementById('email-newsletter-promo-two-section').appendChild(promoTwoTable)
    }






    // Create the admin button for copying HTML and the admin messages
    var codeContainer = document.createElement('div')
    codeContainer.classList = 'container admin-html-button'

    // Create copy button and functionality
    var button = document.createElement('button')
    button.onclick = function(){
        navigator.clipboard.writeText(email.innerHTML)
        button.innerText = 'Your email-ready HTML has been copied to clipboard!'
        button.style.backgroundColor = 'grey'
    }

    // Append
    var main = document.getElementsByTagName('main')[0]
    button.innerText = 'Click to copy your newsletter HTML'
    codeContainer.appendChild(button)
    main.appendChild(codeContainer)
}