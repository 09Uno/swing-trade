// ========== COMPONENTE DE PAGINAÇÃO ==========

export class Paginator {
  constructor(containerId, itemsPerPageOptions = [10, 25, 50, 100]) {
    this.containerId = containerId;
    this.itemsPerPageOptions = itemsPerPageOptions;
    this.currentPage = 1;
    this.itemsPerPage = itemsPerPageOptions[0];
    this.totalItems = 0;
    this.items = [];
    this.renderCallback = null;
  }

  setItems(items) {
    this.items = items;
    this.totalItems = items.length;
    this.currentPage = 1;
    return this;
  }

  setRenderCallback(callback) {
    this.renderCallback = callback;
    return this;
  }

  getTotalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getCurrentPageItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.items.slice(start, end);
  }

  goToPage(page) {
    const totalPages = this.getTotalPages();
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    this.currentPage = page;
    this.render();
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  setItemsPerPage(count) {
    this.itemsPerPage = parseInt(count);
    this.currentPage = 1;
    this.render();
  }

  render() {
    if (this.renderCallback) {
      this.renderCallback(this.getCurrentPageItems());
    }
    this.renderControls();
  }

  renderControls() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const totalPages = this.getTotalPages();
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

    // Gera opções de páginas para exibir
    const pageNumbers = this.getPageNumbers(totalPages);

    container.innerHTML = `
      <div class="pagination-container">
        <div class="pagination-info">
          Mostrando <strong>${start}</strong> a <strong>${end}</strong> de <strong>${this.totalItems}</strong> itens
        </div>

        <div class="pagination-controls">
          <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.paginators['${this.containerId}'].prevPage()">
            ◄ Anterior
          </button>

          <div class="pagination-pages">
            ${pageNumbers.map(num => {
              if (num === '...') {
                return `<span class="pagination-ellipsis">...</span>`;
              }
              return `<button class="pagination-page ${num === this.currentPage ? 'active' : ''}"
                onclick="window.paginators['${this.containerId}'].goToPage(${num})">${num}</button>`;
            }).join('')}
          </div>

          <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="window.paginators['${this.containerId}'].nextPage()">
            Próximo ►
          </button>
        </div>

        <div class="pagination-per-page">
          <label>
            Itens por página:
            <select onchange="window.paginators['${this.containerId}'].setItemsPerPage(this.value)">
              ${this.itemsPerPageOptions.map(opt =>
                `<option value="${opt}" ${opt === this.itemsPerPage ? 'selected' : ''}>${opt}</option>`
              ).join('')}
            </select>
          </label>
        </div>
      </div>
    `;
  }

  getPageNumbers(totalPages) {
    const current = this.currentPage;
    const delta = 2; // Quantas páginas mostrar ao redor da atual
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Primeira página
        i === totalPages || // Última página
        (i >= current - delta && i <= current + delta) // Páginas ao redor da atual
      ) {
        pages.push(i);
      }
    }

    // Adiciona reticências
    const pagesWithEllipsis = [];
    let prev = 0;

    for (const page of pages) {
      if (prev && page - prev > 1) {
        pagesWithEllipsis.push('...');
      }
      pagesWithEllipsis.push(page);
      prev = page;
    }

    return pagesWithEllipsis;
  }
}

// Armazena instâncias de paginadores globalmente
if (!window.paginators) {
  window.paginators = {};
}

export function createPaginator(containerId, options) {
  const paginator = new Paginator(containerId, options);
  window.paginators[containerId] = paginator;
  return paginator;
}
