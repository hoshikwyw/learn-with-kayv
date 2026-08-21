/**
 * The shape every `useActionState` action in this app resolves to.
 *
 * `undefined` is the initial state, before the form has been submitted:
 *
 *   const [state, formAction, pending] = useActionState(myAction, undefined);
 */
export type ActionState = { error?: string; success?: string } | undefined;
