const ReactCompilerConfig = {
  target: "19", // '17' | '18' | '19'
};

module.exports = function () {
  return {
    plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
  };
};
