class Plan {
    constructor(userId, option, minCredits, maxCredits) {
      //option can be full time or part time
        this.userId = userId;
        this.option= option;
        this.minCredits=minCredits;
        this.maxCredits=maxCredits;
    }
}

module.exports = Plan;
