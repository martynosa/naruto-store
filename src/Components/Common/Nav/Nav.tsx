import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classes from './Nav.module.css';
// redux
import { useDispatch, useSelector } from 'react-redux';
import {
  cartActions,
  modalActions,
  RootState,
  authActions,
} from '../../../redux/reduxStore';
import { IModalPayload } from '../../../redux/modalSlice';
// firebase
import {
  browserLocalPersistence,
  setPersistence,
  signOut,
} from 'firebase/auth';
import { auth, db } from '../../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
// typescript
import { ICartItem } from '../../../types/cart';

const Nav: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const cart = useSelector((state: RootState) => state.cart);
  const [totalCartItemCount, setTotalCartItemCount] = useState(0);
  const dispatch = useDispatch();

  const openModal = (form: IModalPayload) => dispatch(modalActions.open(form));

  const signOutHandler = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signOut(auth);
      dispatch(authActions.unsetUser());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // counts the total item count
    const count = cart.reduce((accumulator, item) => {
      return accumulator + item.quantity;
    }, 0);
    setTotalCartItemCount(count);
  }, [cart]);

  useEffect(() => {
    // initializes the cart
    const cartItemArray: ICartItem[] = [];
    if (user) {
      const cartRef = collection(db, 'users', user.id, 'cart');
      getDocs(cartRef)
        .then((cartSnap) => {
          cartSnap.forEach((cartItemSnap) => {
            const cartItem = { id: cartItemSnap.id, ...cartItemSnap.data() };
            cartItemArray.push(cartItem as ICartItem);
          });
          dispatch(cartActions.initialize(cartItemArray));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [user]);

  const unauthenticatedNav = (
    <>
      <Link to="/">home</Link>
      <Link to="/store">store</Link>
      <div className={classes.group}>
        <button
          onClick={() => openModal('signin')}
          className={classes['sign-in']}
        >
          sign in
        </button>
        <button
          onClick={() => openModal('signup')}
          className={classes['sign-up']}
        >
          sign up
        </button>
      </div>
    </>
  );

  const authenticatedNav = (
    <>
      <Link to="/store">store</Link>
      <div className={classes.group}>
        <p className={classes.displayname}>{user?.displayName}</p>
        <Link to="/cart" className={classes.cart}>
          <span>{totalCartItemCount} </span>
          cart
        </Link>
        {user?.email !== null && (
          <button onClick={signOutHandler} className={classes['sign-out']}>
            sign out
          </button>
        )}
      </div>
    </>
  );

  return (
    <nav className={classes.nav}>
      {user && authenticatedNav}
      {!user && unauthenticatedNav}
    </nav>
  );
};
export default Nav;
