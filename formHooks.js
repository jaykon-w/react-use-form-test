import { useEffect, useRef, useState, useCallback } from 'react';

export const useStateWithCallback = initState => {
  const callbackRef = useRef(null);

  const [state, setState] = useState(initState);

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(state);
      callbackRef.current = null;
    }
  }, [state]);

  const setCallbackState = (value, callback) => {
    callbackRef.current = typeof callback === 'function' ? callback : null;
    setState(value);
  };

  return [state, setCallbackState];
};

export const useField = (
  initialValue,
  validators = [],
  transformer = value => [value, value]
) => {
  const [value, setValue] = useStateWithCallback(initialValue);
  const [errors, setErrors] = useState([]);
  const [formatted, setFormattedValue] = useState(transformer(initialValue)[1]);

  const runValidators = (_validators, val) => _validators.map(e => e(val)).filter(Boolean);
  const validate = (v = value) => setErrors(runValidators(validators, v));
  const isInvalid = (v = value) => !!runValidators(validators, v).length;
  const rawSetValue = (v, c = () => {}) => {
    const format = transformer(v);
    setFormattedValue(format[1]);
    setValue(format[0], () => c(format[0]));
  };

  return {
    value,
    formatted,
    validators,
    initialValue,
    errors,
    setValue: useCallback(rawSetValue, [value]),
    setErrors,
    validate: useCallback(validate, [value]),
    isInvalid: useCallback(isInvalid, [value]),
    uncached: {
      value,
      formatted,
      validators,
      initialValue,
      errors,
      setValue: rawSetValue,
      setErrors,
      validate,
      isInvalid
    }
  };
};

export const useForm = (fields) => {
  if (typeof fields === 'function') {
    fields = fields();
  }

  const validate = () => {
    Object.keys(fields).forEach(e => fields[e].validate(fields[e].value));
    return !isInvalid();
  };
  const clearErrors = () => Object.keys(fields).forEach(e => fields[e].setErrors([]));
  const setValues = (obj) => Object.keys(obj).forEach(e => fields[e].setValue(obj[e]));
  const clear = () => {
    Object.keys(fields).forEach(e => fields[e].setValue(fields[e].initialValue));
    clearErrors();
  };
  const isInvalid = () => Object.keys(fields).some(e => fields[e].isInvalid(fields[e].value));
  const toJSON = () =>
    Object.keys(fields)
      .map(e => ({ [e]: fields[e].value }))
      .reduce((a, b) => ({ ...a, ...b }), {});

  return [
    fields,
    {
      clear,
      clearErrors,
      isInvalid,
      setValues,
      toJSON,
      validate,
    }
  ];
};
