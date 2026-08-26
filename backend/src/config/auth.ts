if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT_SECRET e JWT_REFRESH_SECRET precisam estar definidos no .env. " +
      "Nunca use os valores padrão do código-fonte em produção."
  );
}

export default {
  secret: process.env.JWT_SECRET,
  expiresIn: "8h",
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: "30d"
};
