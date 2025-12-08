// components/Navbar.tsx

import { getAuthSession } from "../../lib/server-auth";
import { NavbarClient } from "./NavbarClient";

const Navbar = async () => {
  const session = await getAuthSession();

  return <NavbarClient session={session} />;
};

export default Navbar;