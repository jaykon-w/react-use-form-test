import React, { Component } from "react";
import { render } from "react-dom";
import "./style.css";
import { useForm, useField } from "./formHooks";
import { stringMask } from "stringmask-js";
import { isEmail } from "validator";

const phoneInputMask = value => [ value.replace(/\D/g, ''), stringMask("(00) 0000-00000", /\D/g)(value)];

const required = val => (val ? undefined : "Campo obrigatório");
const validateEmail = val => (isEmail(val) ? undefined : "E-mail inválido");
const validatePhone = val => /\d{10,11}/.test(val) ? undefined : "Telefone inválido";

const CompleteField = ({ value, errors, setValue, validate, t }) => {
  return (
    <>
      <input
        value={value}
        onChange={({ target: { value } }) =>
          setValue(value, cleanValue => validate(cleanValue))
        }
      />
      {errors.map((e, i) => (
        <div key={i} style={{color: 'red', fontSize: '12px'}}>{e}</div>
      ))}
    </>
  );
};

const ContactForm = props => {
  const [
    contactFields,
    { validate, clear, isInvalid, toJSON, setValues }
  ] = useForm({
    name: useField("", [required]),
    email: useField("", [required, validateEmail]),
    phone: useField("", [required, validatePhone], phoneInputMask),
  });

  return (
    <div>
      <div>
        <label>Nome:</label>
        <CompleteField
          value={contactFields.name.formatted}
          errors={contactFields.name.errors}
          setValue={contactFields.name.setValue}
          validate={contactFields.name.validate}
        />
      </div>
      <br />
      <div>
        <label>Email:</label>
        <CompleteField
          value={contactFields.email.formatted}
          errors={contactFields.email.errors}
          setValue={contactFields.email.setValue}
          validate={contactFields.email.validate}
        />
      </div>
      <br />
      <div>
        <label>Telefone:</label>
        <CompleteField
          value={contactFields.phone.formatted}
          errors={contactFields.phone.errors}
          setValue={contactFields.phone.setValue}
          validate={contactFields.phone.validate}
        />
      </div>

      <br />
      <div>
        <button onClick={clear}>Limpar</button> 
        &nbsp;
        <button disabled={isInvalid()} onClick={() => console.log(toJSON())}>Enviar</button>
      </div>
    </div>
  );
};

class App extends Component {

  render() {
    return <ContactForm />;
  }
}

render(<App />, document.getElementById("root"));
