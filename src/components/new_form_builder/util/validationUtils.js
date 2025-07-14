function validationKeys(validation) {
  const rules = String(validation);

  return rules.split("|").reduce((state, rule) => {
    const [name, argsWithMessage] = rule.split("-");

    if (!argsWithMessage) {
      state[name] = {
        args: true,
        message: null,
      };
      return state;
    }

    const [params, ...messageParts] = argsWithMessage.split(" ");
    const message = messageParts.join(" ").replace(/[()]/g, "");

    const args = params.includes(",") ? params.split(",") : params;

    state[name] = {
      args,
      message: message || null,
    };

    return state;
  }, {});
}


export { validationKeys };
