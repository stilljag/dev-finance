const Modal = {
  open() {
    //abrir modal
    document.querySelector(".modal-overlay").classList.add("active");
  },

  close() {
    //fechar modal
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes(transaction) {
    let income = 0;

    Transaction.all.forEach((item) => {
      if (item.amount > 0) {
        income += item.amount;
      }
    });

    return income;
  },

  expenses() {
    let expense = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });

    return expense;
  },

  total() {
    //entradas - saídas
    const total = document.querySelector(".card.total");
    const result = Transaction.incomes() + Transaction.expenses();

    if (result < 0) {
      total.style.background = "#e92929";
    } else {
      total.style.background = "#49aa26";
    }

    return result;
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onClick="Transaction.remove(${index})" src="../public/assets/minus.svg" alt="remover transação" />
    </td>
  `;
    return html;
  },

  updatebalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );

    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );

    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatCurrency(value) {
    const formatReais = JSON.parse(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return formatReais;
  },

  formatAmount(value) {
    value = Number(value.replace(/\,\./g, ""));

    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
  captureMes(date) {
    const splittedDate = date.split("-");

    return `${splittedDate[1]}`;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validadeFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    (Form.description.value = ""),
      (Form.amount.value = ""),
      (Form.date.value = "");
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validadeFields();

      const transaction = Form.formatValues();

      Transaction.add(transaction);

      Form.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const Filtro = {
  searchDate() {
    const filtro = document.querySelector(".select").value;
    const ShowFiltro = [];
    validate = 0;
    incomes = 0;
    expenses = 0;
    total = 0;

    const tt = Transaction.all.forEach((transaction, index) => {
      const splittedDate = transaction.date.split("/");

      if (Number(splittedDate[1]) == filtro) {
        DOM.clearTransactions();
        ShowFiltro.push({ transaction, index });

        if (transaction.amount > 0) {
          incomes += transaction.amount;
        } else if (transaction.amount < 0) {
          expenses += transaction.amount;
        }
        total += transaction.amount;

        validate = 1;
      }
    });

    if (validate == 1) {
      for (const item of ShowFiltro) {
        ShowFiltro.sort(new Date(item.transaction.date));
        const CSSclass = item.transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(item.transaction.amount);

        let html = `<td class="description">${item.transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${item.transaction.date}</td>
        <td><img onClick="Transaction.remove(${item.index})" src="../public/assets/minus.svg" alt="remover transação" />
        </td>
      `;

        const tr = document.createElement("tr");
        tr.innerHTML = html;
        tr.dataset.index = item.index;
        DOM.transactionsContainer.appendChild(tr);

        document.getElementById(
          "incomeDisplay"
        ).innerHTML = Utils.formatCurrency(incomes);

        document.getElementById(
          "expenseDisplay"
        ).innerHTML = Utils.formatCurrency(expenses);

        document.getElementById(
          "totalDisplay"
        ).innerHTML = Utils.formatCurrency(total);

        if (total < 0) {
          document.querySelector(".card.total").style.background = "#e92929";
        } else {
          document.querySelector(".card.total").style.background = "#49aa26";
        }

        validate = 0;
      }
    } else if (document.querySelector(".select").value == "all") {
      App.init();
    } else {
      alert("Nenhum informação encontrada");
      DOM.clearTransactions();
      App.init();
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    DOM.updatebalance();

    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
