const axios = require('axios')
import dompurify from 'dompurify'

function searchResultsHTML (stores) {
  return stores.map(store => {
    return `<a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
        </a>`
  }).join('')
}

function typeAhead (search) {
  if (!search) return

  const searchInput = search.querySelector('input[name="search"]')
  const searchResults = search.querySelector('.search__results')
  searchInput.on('input', function () {
    if (!this.value) {
      searchResults.style.display = 'none'
      return
    }
    searchResults.style.display = 'block'
    axios
      .get(`/api/search?q=${this.value}`)
      .then(
         res => {
          if (res.data.length) {
            searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data))
            return
          }
            searchResults.innerHTML = dompurify.sanitize(`<div class="search__results"> No results for ${this.value} found </div>`)
        }
    ).catch(err => {
      console.error(err)
    })
  })
  searchInput.on('keyup', (e) => {
    // if they aren't pressing up, down or enter, Who cares!
    if (![38, 40, 13].includes(e.KeyCode)) return
    const activeClass = 'search__result--active'
    // The querySelector() method returns the first element that matches a specified CSS selector(s) in the document. 
    const current = search.querySelector(`.${activeClass}`)
    // The querySelectorAll() method returns all elements in the document that matches a specified CSS selector(s), as a static NodeList object.
    const items = search.querySelectorAll('.search__result')
    let next
    // down arrow
    if (e.KeyCode === 40 && current) {
      // The nextElementSibling property returns the element immediately following the specified element, in the same tree level.
      // retorna el elemento inmediátamente posterior al especificado, dentro de la lista de elementos hijos de su padre, o bien null si el elemento especificado es el último en dicha lista.
      next = current.nextElementSibling || [0]
    } else if (e.KeyCode === 40) {
      next === items[0]
    // up arrow
    } else if (e.KeyCode === 38 && current) {
      // Definition and Usage. The previousElementSibling property returns the previous element of the specified element, in the same tree level.
      //
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.KeyCode === 38) {
      next === items[items.length - 1]
    // enter
    }else if (e.KeyCode === 13 && current.href) {
      window.location === current.href
      return
    }
    //The classList property returns the class name(s) of an element, as a DOMTokenList object. This property is useful to add, remove and toggle CSS classes on an element.
    if (current) current.classList.remove(activeClass)
    next.classList.add(activeClass)
  })
}

export default typeAhead
