package com.example.demo.decorator;

/**
 * Abstract Decorator - base class cho các decorator.
 * Wraps một BaseAction và delegate execute/getDescription.
 */
public abstract class ActionDecorator implements BaseAction {

    protected final BaseAction wrappedAction;

    public ActionDecorator(BaseAction wrappedAction) {
        this.wrappedAction = wrappedAction;
    }

    @Override
    public String execute() {
        return wrappedAction.execute();
    }

    @Override
    public String getDescription() {
        return wrappedAction.getDescription();
    }
}
