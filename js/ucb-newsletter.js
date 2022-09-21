    var article = document.querySelector('.ucb-newsletter')
    var loggedIn = article.getAttribute('data-loggedin') == 'true' ? true : false;
    var email = document.getElementById('email-preview')

// init
if(loggedIn){
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
        console.log(article)

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
        console.log('these are my kids', article.children[0].children)
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
    // After articles, create and append button, button containers
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







    // Create the admin button for copying HTML and the admin messages
    var codeContainer = document.createElement('div')
    codeContainer.classList = 'container admin-html-button'

    // Create copy button and functionality
    var button = document.createElement('button')
    button.onclick = function(){
        // navigator.clipboard.writeText(htmlTemplate)
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


// // Copy the html to clipboard
// navigator.clipboard.writeText(articleContainer.innerHTML)