package io.acari.sogos.stream

import com.facebook.react.bridge.*
import okhttp3.*
import okhttp3.Callback
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.IOException


class StreamModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "Stream"

  companion object {
    private val client = OkHttpClient()
  }

  @ReactMethod
  fun performGet(
      url: String,
      headers: ReadableMap,
      promise: Promise
  ) {
    val requestHeaders = Headers.Builder()
    for ((key, value) in headers.entryIterator) {
      requestHeaders.add(key, value.toString())
    }

    val request = Request.Builder()
        .url(url)
        .headers(requestHeaders.build())
        .build()

    client.newCall(request).enqueue(object : Callback {
      override fun onFailure(call: Call, e: IOException) {
        promise.reject(e)
      }

      override fun onResponse(call: Call, response: Response) {
        response.use { res ->
          if (res.isSuccessful) {
            val fullResponse = res.body()?.charStream()?.use {
              val items = Arguments.createArray()
              val reader = BufferedReader(it)
              var line: String? = reader.readLine()
              while (line != null) {
                println(line)
//                val json = JSONObject(line)
//                items.pushMap(Arguments.makeNativeMap(toMap(json)))
                line = reader.readLine()
              }
              items
            }

            if (fullResponse != null) {
              promise.resolve(fullResponse)
            } else {
              promise.reject(IllegalStateException("Unable to get stuff from $url"))
            }
          } else {
            promise.reject(res.code().toString(), "Shit did not work")
          }
        }
      }
    })
  }
}

fun toMap(jsonobj: JSONObject): Map<String, Any> {
  val map: MutableMap<String, Any> = HashMap()
  val keys = jsonobj.keys()
  while (keys.hasNext()) {
    val key = keys.next()
    var value = jsonobj[key]
    if (value is JSONArray) {
      value = toList(value)
    } else if (value is JSONObject) {
      value = toMap(value)
    }
    map[key] = value
  }
  return map
}

fun toList(array: JSONArray): List<Any> {
  val list: MutableList<Any> = ArrayList()
  for (i in 0 until array.length()) {
    var value = array[i]
    if (value is JSONArray) {
      value = toList(value)
    } else if (value is JSONObject) {
      value = toMap(value)
    }
    list.add(value)
  }
  return list
}