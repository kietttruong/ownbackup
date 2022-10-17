trigger ReactionTrigger on Reaction__c (after insert) {

    ReactionTrigger.handleAfterCreate(trigger.new);

}