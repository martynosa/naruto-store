import { FormEvent, useState } from 'react';
import classes from './AuthModal.module.css';
// redux
import { useDispatch, useSelector } from 'react-redux';
import {
  authActions,
  loadingActions,
  RootState,
} from '../../../../redux/reduxStore';
// firebase
import { auth } from '../../../../firebase/firebase';
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
// typescript
import {
  defaultAuthError,
  IAuthError,
  defaultError,
} from '../../../../typescript/interfaces';
// helpers
import {
  emailValidator,
  lengthValidator,
} from '../../../../helpers/validators';

interface IProps {
  closeModal: () => void;
}

const SignInModal: React.FC<IProps> = ({ closeModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<IAuthError>(defaultAuthError);

  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.loading);

  const signInHandler = async (e: FormEvent) => {
    e.preventDefault();

    if (
      authError.email.status ||
      authError.password.status ||
      email === '' ||
      password === ''
    ) {
      console.log('errors =>', authError);
      return;
    }

    dispatch(loadingActions.setLoading({ ...loading, isAuthLoading: true }));

    try {
      await setPersistence(auth, browserLocalPersistence);
      const user = await signInWithEmailAndPassword(auth, email, password);

      dispatch(
        authActions.setUser({
          id: user.user.uid,
          email: user.user.email,
          displayName: user.user.displayName,
        })
      );

      closeModal();
      dispatch(loadingActions.setLoading({ ...loading, isAuthLoading: false }));
    } catch (error) {
      console.log(error);
      dispatch(loadingActions.setLoading({ ...loading, isAuthLoading: false }));
    }
  };

  const validateEmail = (email: string) => {
    const error = emailValidator(email);
    if (error.status) {
      setAuthError((prevState) => {
        return { ...prevState, email: error };
      });
      return;
    }
    setAuthError((prevState) => {
      return { ...prevState, email: defaultError };
    });
  };

  const validatePassword = (password: string) => {
    const error = lengthValidator(password, 6);
    if (error.status) {
      setAuthError((prevState) => {
        return { ...prevState, password: error };
      });
      return;
    }
    setAuthError((prevState) => {
      return { ...prevState, password: defaultError };
    });
  };

  const onChangeEmail = (email: string) => {
    setEmail(email);
    validateEmail(email);
  };

  const onChangePassword = (password: string) => {
    setPassword(password);
    validatePassword(password);
  };

  return (
    <form onSubmit={signInHandler} className={classes['auth-form']}>
      <h1>Sign In</h1>
      <div className={classes['auth-form-group']}>
        <div className="input-group">
          <label htmlFor="email">email</label>
          <input
            id="email"
            type="text"
            onChange={(e) => onChangeEmail(e.target.value)}
          />
          {authError.email.status && (
            <p className="error">{authError.email.message}</p>
          )}
          {!authError.email.status && (
            <p className="error-placeholder">no error</p>
          )}
        </div>
        <div className="input-group">
          <label htmlFor="password">password</label>
          <input
            id="password"
            type="password"
            onChange={(e) => onChangePassword(e.target.value)}
          />
          {authError.password.status && (
            <p className="error">{authError.password.message}</p>
          )}
          {!authError.password.status && (
            <p className="error-placeholder">no error</p>
          )}
        </div>
        <div className={classes['auth-button-group']}>
          <button type="button" onClick={closeModal} className="close">
            close
          </button>
          {loading.isAuthLoading ? (
            <button className="disabled" disabled={loading.isAuthLoading}>
              Loading...
            </button>
          ) : (
            <button className="sign-in">sign in</button>
          )}
        </div>
      </div>
    </form>
  );
};

export default SignInModal;