module.exports = function(grunt) {
  grunt.initConfig({
    compass: {
      dev: {
        options: {
          relativeAssets: true,
          sassDir: 'css',
          cssDir: 'css'
        }
      }
    },
    autoprefixer: {
      dev: {
        expand: true,
        flatten: true,
        src: '*.css',
        dest: ''
      }
    },
    watch: {
      dev: {
        files: ['*.scss', '*.js'],
        tasks: ['compass', 'autoprefixer'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');

  grunt.registerTask('default', ['compass', 'autoprefixer', 'watch']);
};
