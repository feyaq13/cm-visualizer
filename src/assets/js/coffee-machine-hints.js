export class Hints {
  constructor(listElement) {
    this.listElement = listElement
    this.showHints()
  }

  showHints() {
    let promise = Promise.resolve(document.body.classList.add('hints-mode'));

    Array.prototype.forEach.call(this.listElement, (elem) => {
      promise = promise.then(() => {
        this.showInstructionFor(elem);

        return new Promise(resolve => {
          setTimeout(resolve, 3000);
        });
      });
    })

    promise.finally(() => document.body.classList.remove('hints-mode'));
  }

  showDef(elem) {
      console.log('делает то-то')
  }

  showInstructionFor(elem) {
    elem.classList.add('selected');
    this.showDef(elem)

    setTimeout(
      () => elem.classList.remove('selected'),
      2000
    )
  }
}
