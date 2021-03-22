const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin") 

module.exports = {
  // Changed the entry point to a .tsx file
  entry: {
    app: path.resolve(__dirname, "src", "index.tsx"),
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
		'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
		'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
		'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker'
  },
  // Enable sourcemaps for debugging Webpack's output
  devtool: "source-map",
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  output: {
    globalObject: 'self',
    path: path.join(__dirname, "/dist"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { 
        test: /\.tsx?$/, 
        loader: "awesome-typescript-loader" 
      },
      {
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
      {
				test: /\.ttf$/,
				use: ['file-loader']
			}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html")  // Specify the HTML template to use
    })
  ]
}