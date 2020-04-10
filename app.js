var budgetController = (() => {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1
  }

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = (this.value / totalIncome * 100).toFixed(2);
    } else {
      this.percentage = -1
    }
  }

  Expense.prototype.getPercentage = function () {
    return this.percentage
  }

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var calculateTotal = function (type) {
    var sum;
    sum = data.allItems[type].reduce(function (total, cur) {
      return total + cur.value
    }, 0)
    data.totals[type] = sum;
  }

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: -1
  }

  return {
    addItem: function (type, desc, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length !== 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1
      }
      else ID = 0

      // Creeate new item based
      if (type === 'exp') {
        newItem = new Expense(ID, desc, val)
      } else {
        newItem = new Income(ID, desc, val)
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index
      ids = data.allItems[type].map(function (cur) {
        return cur.id
      })

      index = ids.indexOf(id)

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');
      // Calculate the budget
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate percentage
      if (data.totals.inc > 0) {
        data.percentage = (data.totals.exp / data.totals.inc * 100).toFixed(2)
      } else {
        data.percentage = -1
      }
    },

    calculatePercentage: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc)
      })
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage()
      })
      return allPerc
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    }
  }
})()

var UIController = (() => {
  // get DOM
  var DOMStrings = {
    inputType: '.add__type',
    inputdescription: '.add__description',
    inputvalue: '.add__value',
    inputBtn: '.add__btn',
    incomeList: '.income__list',
    expensesList: '.expenses__list',
    budgetValue: '.budget__value',
    incomeValue: '.budget__income--value',
    expensesValue: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expPerc: '.item__percentage',
    monthLabel: '.budget__title--month',
  }

  var formatNumber = function (num, type) {
    var numsplit;
    num = Math.abs(num);
    num = num.toFixed(2);

    numsplit = num.toString().split('.');
    numsplit[0] = numsplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (type === 'inc' ? '+' : '-') + ' ' + numsplit.join('.')
  };

  var nodeList = function (list, cb) {
    for (var i = 0; i < list.length; i++) {
      cb(list[i], i)
    }
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputdescription).value,
        value: document.querySelector(DOMStrings.inputvalue).value * 1  // * 1 ==> convert string to number
      }
    },

    addListItems: function (obj, type) {
      var html, element;
      // Create html string
      if (type === 'inc') {
        element = DOMStrings.incomeList
        html = `<div class="item clearfix" id="${type}-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                        <div class="item__value"> ${formatNumber(obj.value, type)} </div>
                        <div class="item__delete">
                          <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                      </div>
                  </div>`
      }
      else if (type === 'exp') {
        element = DOMStrings.expensesList
        html = ` <div class="item clearfix" id="${type}-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix"> 
                        <div class="item__value"> ${formatNumber(obj.value, type)} </div>
                        <div class="item__percentage">${obj.percentage}</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`
      }

      // Insert html into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', html);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.remove();
    },

    clearFields: function () {
      document.querySelector(DOMStrings.inputvalue).value = '';
      document.querySelector(DOMStrings.inputdescription).value = '';
    },

    displayBudget: function (obj) {
      var type;
      obj.budget >= 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeValue).textContent = formatNumber(obj.totalInc, 'inc')
      document.querySelector(DOMStrings.expensesValue).textContent = formatNumber(obj.totalExp, 'exp')

      if (obj.percentage >= 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = (obj.percentage) + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---'
      }
    },

    displayPercentage: function (percentages) {
      var fields = document.querySelectorAll(DOMStrings.expPerc)

      nodeList(fields, function (cur, i) {
        if (percentages[i] >= 0) {
          cur.textContent = percentages[i] + '%'
        } else {
          cur.textContent = '---'
        }
      })
    },

    displayMonth: function () {
      var now, month, year;
      var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      now = new Date();
      month = now.getMonth()
      year = now.getFullYear()
      document.querySelector(DOMStrings.monthLabel).textContent = monthNames[month] + ' ' + year
    },

    changeInputType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputdescription + ',' +
        DOMStrings.inputvalue
      )

      nodeList(fields, function (cur) {
        cur.classList.toggle('red-focus')
      })

      document.querySelector(DOMStrings.inputBtn).classList.toggle('red')

    },

    getDOMString: function () {
      return DOMStrings
    }
  }
})()

var controller = ((budgetCtrl, UICtrl) => {

  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMString()
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem()
      }
    })

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeInputType)
  }

  var updatePercentagets = function () {
    // 1.Calucate percentaget
    budgetCtrl.calculatePercentage()

    // 2. Read percentage from the budget controller
    var percentage = budgetCtrl.getPercentages()

    // 3. Update UI
    UICtrl.displayPercentage(percentage)

  }

  var updateBudget = function () {
    // Calculate the budget
    budgetCtrl.calculateBudget()

    // Return budget 
    var budget = budgetCtrl.getBudget()

    // Get in the UI
    UICtrl.displayBudget(budget)
  }

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get input value data
    input = UICtrl.getInput()

    // 2. Add item the budget controller
    if (input.description != '' && input.value != 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value)

      //3.Get item to the UI
      listBudget = UICtrl.addListItems(newItem, input.type)

      //4.Clear fields 
      UICtrl.clearFields()

      updateBudget()

      // update percentaget
      updatePercentagets()
    }
  }

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, ID, type;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0]
      ID = splitID[1] * 1

      // Delete item 
      budgetController.deleteItem(type, ID)

      // Remove item in the UI
      UICtrl.deleteListItem(itemID)

      // Update budget in the UI 
      updateBudget()

      //
      updatePercentagets()

    }
  }

  return {
    init: function () {
      console.log('App start');
      UICtrl.displayMonth()
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners()
    }
  }

})(budgetController, UIController)


controller.init()
