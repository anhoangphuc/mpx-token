use aiken/transaction.{ScriptContext}

validator {
  fn mpx_token(_rdmr: Data, _ctx: ScriptContext) -> Bool {
    True
  }
}
