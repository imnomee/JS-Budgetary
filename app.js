const DOMStrings = {
  inputType: document.querySelector(".add__type"),
  inputDesc: document.querySelector(".add__description"),
  inputVal: document.querySelector(".add__value"),
  btnAdd: document.querySelector(".add__btn"),
  listIncome: document.querySelector(".income__list"),
  listExpense: document.querySelector(".expenses__list"),
  labelBudget: document.querySelector(".budget__value"),
  labelIncome: document.querySelector(".budget__income--value"),
  labelExpense: document.querySelector(".budget__expenses--value"),
  labelExpensePerc: document.querySelector(".budget__expenses--percentage"),
  container: document.querySelector(".container"),
};
const budgetController = (function () {
  const Expense = function (id, desc, val) {
    this.id = id;
    this.desc = desc;
    this.val = val;
    this.percentage = -1;
  };
  const Income = function (id, desc, val) {
    this.id = id;
    this.desc = desc;
    this.val = val;
  };
  Expense.prototype.calcPercentage = (totalIncome) => {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.val / totalIncome) * 100);
    }
  };
  Expense.prototype.getPercentage = () => {
    return this.percentage;
  };
  const calculateTotal = (type) => {
    const sum = data.allItems[type].reduce((totals, item) => {
      return totals + item.val;
    }, 0);
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };
  return {
    addItem: function (type, desc, value) {
      let newItem, id;
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else id = 0;
      if (type === "exp") {
        newItem = new Expense(id, desc, value);
      } else if (type === "inc") {
        newItem = new Income(id, desc, value);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    calculateBudget: function () {
      calculateTotal("exp");
      calculateTotal("inc");
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > data.totals.exp) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else data.percentage = 0;
    },
    deleteItem: (type, id) => {
      const ids = data.allItems[type].map((item) => item.id);
      const index = ids.indexOf(id);
      if (index != -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        perc: data.percentage,
      };
    },
    calculatePercentages: function () {
      data.allItems["exp"].forEach((el) => {
        console.log(el);
        el.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      return data.allItems["exp"].map((el) => el.getPercentage());
    },
    testing: function () {
      console.log(data);
    },
  };
})();

const UIContoller = (function () {
  return {
    getInput: () => {
      return {
        type: DOMStrings.inputType.value,
        desc: DOMStrings.inputDesc.value,
        val: parseFloat(DOMStrings.inputVal.value),
      };
    },
    addListItem: (obj, type) => {
      let html;
      if (type === "inc") {
        let item = document.createElement("div");
        item.id = `inc-${obj.id}`;
        item.className = "item clearfix";
        html = `
            <div class="item__description">${obj.desc}</div>
            <div class="right clearfix">
                <div class="item__value">${obj.val}</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
        item.innerHTML = html;
        DOMStrings.listIncome.appendChild(item);
      } else if (type === "exp") {
        let item = document.createElement("div");
        item.id = `exp-${obj.id}`;
        item.className = "item clearfix";
        html = `
            <div class="item__description">${obj.desc}</div>
            <div class="right clearfix">
                <div class="item__value">${obj.val}</div>
                         <div class="item__percentage">21%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
        item.innerHTML = html;
        DOMStrings.listExpense.appendChild(item);
      }
    },
    deleteFields: (id) => {
      const el = document.getElementById(id);
      el.parentNode.removeChild(el);
    },
    clearFields: () => {
      DOMStrings.inputDesc.value = "";
      DOMStrings.inputVal.value = "";
      DOMStrings.inputDesc.focus();
    },
    displayBudget: (obj) => {
      DOMStrings.labelBudget.textContent = obj.budget;
      DOMStrings.labelExpense.textContent = obj.totalExp;
      DOMStrings.labelIncome.textContent = obj.totalInc;
      DOMStrings.labelExpensePerc.textContent = obj.perc + "%";
    },
  };
})();

const controller = (function (budgetCtrl, UICtrl) {
  const eventListeners = () => {
    DOMStrings.btnAdd.addEventListener("click", controlAddItem);
    document.addEventListener("keypress", (e) => {
      if (e.keyCode === 13) {
        controlAddItem();
      }
    });
    DOMStrings.container.addEventListener("click", ctrlDeleteItem);
  };
  function ctrlDeleteItem(e) {
    const itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      const splitItem = itemId.split("-");
      const type = splitItem[0];
      const id = parseInt(splitItem[1]);
      budgetCtrl.deleteItem(type, id);
      UICtrl.deleteFields(itemId);
      updateBudget();
    }
  }
  function updateBudget() {
    budgetCtrl.calculateBudget();
    const budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  }
  function updatePercentages() {
    budgetCtrl.calculatePercentages();
    const percentage = budgetCtrl.getPercentages();
    console.log(percentage);
  }
  function controlAddItem() {
    let input, newItem;
    input = UICtrl.getInput();
    if (input.desc && input.val) {
      newItem = budgetCtrl.addItem(input.type, input.desc, input.val);
      UICtrl.addListItem(newItem, input.type);
      UIContoller.clearFields();
      updateBudget();
      updatePercentages();
    }
  }
  return {
    init: () => {
      eventListeners();
      UICtrl.displayBudget({
        budget: 0,
        totalExp: 0,
        totalInc: 0,
        perc: -1 + "%",
      });
    },
  };
})(budgetController, UIContoller);

controller.init();
