trigger RecipeTrigger on Recipe__c (after update) {
    RecipeTrigger.handleAfterUpdate(trigger.new);
}