// приватная ф-ция:
const getTemplate = (data = [], placeholder, selectedId) => {
  // ?? - новый синтаксис es7: если true ?? если false
  let text = placeholder ?? 'Placeholder по-умолчанию...';

  const items = data.map((item) => {
    let cls = '';

    if (item.id === selectedId) {
      text = item.value;
      cls = 'selected';
    }

    return `
      <li class="select__item ${cls}" data-type="item" data-id="${item.id}">${item.value}</li>
    `;
  });

  return `
    <div class="select__backdrop" data-type="backdrop"></div>
    <div class="select__input" data-type="input">
      <span data-type="value">${text}</span>
      <i class="fa fa-chevron-down" data-type="arrow"></i>
    </div>
    <div class="select__dropdown">
      <ul class="select__list">
        ${items.join('')} 
      </ul>
    </div>
  `;
};

// переменная с $ - значит исползуется DOM-элемент
// приватные свойства и методы должны начинаться с # - синтаксис es7
export class Select {
  // инстанс класса:
  constructor(selector, options) {
    this.$el = document.querySelector(selector);
    this.options = options;
    this.selectedId = options.selectedId;

    this.#render();
    this.#setup();
  }

  // приватный метод - работа с шаблоном:
  #render() {
    // деструктуризация:
    const { placeholder, data } = this.options;
    this.$el.classList.add('select');
    this.$el.innerHTML = getTemplate(data, placeholder, this.selectedId);
  }

  // приватный метод - работа с настройкой:
  #setup() {
    this.clickHandler = this.clickHandler.bind(this); // привязываем this
    this.$el.addEventListener('click', this.clickHandler);
    // кешируем обращения к dom-дереву:
    this.$arrow = this.$el.querySelector('[data-type="arrow"]');
    this.$value = this.$el.querySelector('[data-type="value"]');
  }

  clickHandler(event) {
    // .dataset - объект с data-атрибутами
    const { type } = event.target.dataset; // получаем значение атрибута data-type

    if (type === 'input') {
      this.toggle();
    } else if (type === 'item') {
      const id = event.target.dataset.id;
      this.select(id);
    } else if (type === 'backdrop') {
      this.close();
    }
  }

  // геттер - не вызываем метод, а обращаемся как к переменной:
  get isOpen() {
    return this.$el.classList.contains('open');
  }

  // будет хранится текущий выбранный элемент:
  get current() {
    return this.options.data.find((item) => item.id === this.selectedId);
  }

  // выбор элемента:
  select(id) {
    this.selectedId = id;
    this.$value.textContent = this.current.value;

    this.$el.querySelectorAll('[data-type="item"]').forEach((el) => {
      el.classList.remove('selected');
    });
    this.$el.querySelector(`[data-id="${id}"]`).classList.add('selected');

    // вызываем callback:
    this.options.onSelect ? this.options.onSelect(this.current) : null;

    this.close();
  }

  // переключатель класса:
  toggle() {
    // геттер - не вызываем метод, а обращаемся как к переменной:
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.$el.classList.add('open');
    this.$arrow.classList.remove('fa-chevron-down');
    this.$arrow.classList.add('fa-chevron-up');
  }

  close() {
    this.$el.classList.remove('open');
    this.$arrow.classList.remove('fa-chevron-up');
    this.$arrow.classList.add('fa-chevron-down');
  }

  destroy() {
    this.$el.removeEventListener('click', this.clickHandler); // удаляем слушатель при удалении плагина
    this.$el.innerHTML = '';
  }
}
